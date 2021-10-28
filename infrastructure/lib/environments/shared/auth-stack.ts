import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { IS_DEV } from "../../../constants";
import * as sns from "@aws-cdk/aws-sns";
import * as subs from "@aws-cdk/aws-sns-subscriptions";
import { VerifySesDomain } from "@seeebiii/ses-verify-identities";

interface Props {
  userPoolName: string;
  environment: string;
  dbTable: dynamodb.Table;
  apigatewayEndpoint: string;
  layer: lambda.LayerVersion[];
}

export class AuthStack extends cdk.Construct {
  userPool: cognito.UserPool;
  identityPool: cognito.CfnIdentityPool;
  lmbdaAuthorizer: lambda.Function;
  poolPolicyAddendum: iam.PolicyStatement;
  topic: sns.Topic;
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    this.topic = new sns.Topic(
      this,
      `${props.environment}-PostConfirmationTopic`,
      {
        displayName: `${props.environment} Post Confirmation Topic`,
      }
    );

    this.userPool = new cognito.UserPool(
      this,
      `${props.environment}-MainPool`,
      {
        userPoolName: props.userPoolName,
        selfSignUpEnabled: true,
        autoVerify: {
          email: true,
        },

        signInAliases: {
          email: true,
        },
        removalPolicy: IS_DEV
          ? cdk.RemovalPolicy.DESTROY
          : cdk.RemovalPolicy.RETAIN,
      }
    );

    this.poolPolicyAddendum = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ["*"],
      actions: [
        "cognito-idp:List*",
        "cognito-idp:Write*",
        "cognito-idp:AdminAddUserToGroup",
      ],
    });

    const uPoolPolicy = new iam.Policy(
      this,
      `${props.environment}-pool-policy`,
      {
        policyName: `${props.environment}-user-pool-post-confirmation`,
        statements: [this.poolPolicyAddendum],
      }
    );

    const userPoolCfn = this.userPool.node.defaultChild as cognito.CfnUserPool;
    userPoolCfn.schema = [
      {
        name: "group",
        attributeDataType: "String",
        mutable: true,
        required: false,
        stringAttributeConstraints: {
          maxLength: "1000",
        },
      },
      {
        name: "org_name",
        attributeDataType: "String",
        mutable: true,
        required: false,
        stringAttributeConstraints: {
          maxLength: "250",
        },
      },
    ];

    new cognito.CfnUserPoolGroup(this, `${props.environment}-AdminGroup`, {
      groupName: "admins",
      userPoolId: this.userPool.userPoolId,
      description: "Admin group.",
    });

    new cognito.CfnUserPoolGroup(this, `${props.environment}-EmployeeGroup`, {
      groupName: "employee",
      userPoolId: this.userPool.userPoolId,
      description: "Employee group.",
    });

    const webClient = this.userPool.addClient(`${props.environment}-web`, {
      userPoolClientName: "web",
      // generateSecret: true,
      // authFlows: {
      //   userPassword: true,
      //   userSrp
      // },
    });

    this.userPool.addClient(`${props.environment}-mobile`, {
      userPoolClientName: "mobile",
    });

    this.identityPool = new cognito.CfnIdentityPool(
      this,
      `${props.environment}-RootIdentityPool`,
      {
        identityPoolName: `${props.environment}-RootIDPool`,
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: webClient.userPoolClientId,
            providerName: this.userPool.userPoolProviderName,
          },
        ],
      }
    );

    const authRole = new iam.Role(
      this,
      `${props.environment}-CognitoDefaultAuthenticatedRole`,
      {
        roleName: `${props.environment}-DefaultAuthRole`,
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": this.identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );

    const unauthRole = new iam.Role(
      this,
      `${props.environment}-anonymous-group-role`,
      {
        roleName: `${props.environment}-DefaultUnauthRole`,
        description: "Default role for anonymous users",
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": this.identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "unauthenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      `${props.environment}-DefaultValid`,
      {
        identityPoolId: this.identityPool.ref,
        roles: {
          unauthenticated: unauthRole.roleArn,
          authenticated: authRole.roleArn,
        },
      }
    );

    const postConfirmationLmbda = new lambda.Function(
      this,
      `${props.environment}-postConfirmation`,
      {
        runtime: lambda.Runtime.PYTHON_3_8,
        handler: "main.handler",
        code: lambda.Code.fromAsset("../lambdas/cognito/postConfirmation"),
        functionName: `${props.environment}-postConfirmation`,
        environment: {
          TOPIC_ARN: this.topic.topicArn,
        },
        layers: props.layer,
      }
    );

    this.lmbdaAuthorizer = new lambda.Function(
      this,
      `${props.environment}-lmbdaAuthorizer`,
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main.handler",
        code: lambda.Code.fromAsset("../lambdas/cognito/authorizer"),
        functionName: `${props.environment}-lmbdaAuthorizer`,
        environment: {
          DB_TABLE: props.dbTable.tableName,
          REGION: process.env.CDK_DEFAULT_REGION as string,
          USER_POOL_ID: this.userPool.userPoolId,
          ENDPOINT: props.apigatewayEndpoint,
        },
      }
    );

    const emailConfirmationLambda = new lambda.Function(
      this,
      `${props.environment}-sendEmail`,
      {
        runtime: lambda.Runtime.PYTHON_3_8,
        handler: "main.handler",
        code: lambda.Code.fromAsset("../lambdas/email/sendEmail"),
        functionName: `${props.environment}-sendEmail`,
        environment: {},
      }
    );

    emailConfirmationLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "SES:SendRawEmail"],
        resources: ["*"],
        effect: iam.Effect.ALLOW,
      })
    );

    postConfirmationLmbda.role!.attachInlinePolicy(uPoolPolicy);
    props.dbTable.grantReadWriteData(postConfirmationLmbda);
    this.userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      postConfirmationLmbda
    );
    const snspubpolicy = new iam.PolicyStatement({
      resources: [this.topic.topicArn],
      actions: ["sns:Publish"],
    });
    postConfirmationLmbda.addToRolePolicy(snspubpolicy);
    this.topic.grantPublish(postConfirmationLmbda);

    this.topic.addSubscription(
      new subs.LambdaSubscription(emailConfirmationLambda)
    );

    cdk.Tags.of(this.userPool).add("environment", props.environment);
    cdk.Tags.of(this.identityPool).add("environment", props.environment);
    cdk.Tags.of(this.lmbdaAuthorizer).add("environment", props.environment);
    cdk.Tags.of(postConfirmationLmbda).add("environment", props.environment);

    new cdk.CfnOutput(this, `${props.environment}-userPoolId`, {
      value: this.userPool.userPoolId,
    });
  }
}
