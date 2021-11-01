import * as cdk from "@aws-cdk/core";
import { VPCStack } from "../shared/vpc";
import { HostedZoneStack } from "../shared/hostedzone-stack";
import { CertificateStack } from "../shared/certificate-stack";
import { FargateBackendStack } from "../shared/fargate-backend-stack";
import { DynamoStack } from "../shared/dynamo-stack";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sqs from "@aws-cdk/aws-sqs";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";

interface Props {}

export class DevStack extends cdk.Construct {
  env: string;
  domainName: string;
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    const environment = "DEV";
    this.domainName = process.env.DOMAIN_NAME as string;
    const defaultId = `${environment}`;

    const rootVPC = new VPCStack(this, defaultId + "-vpc-root-stack", {
      environment,
    });

    const rootHostedZone = new HostedZoneStack(
      this,
      `${environment}-${this.domainName}-hz-stack`,
      {
        domainName: this.domainName,
        environment,
      }
    );

    const rootCertificate = new CertificateStack(
      this,
      `${environment}-${this.domainName}-acm-stack`,
      {
        domainName: this.domainName,
        environment,
        zone: rootHostedZone.zone,
        subDomain: `*`,
      }
    );

    // Stores our users
    const authDb = new DynamoStack(this, defaultId + "-authDb", {
      environment,
      tableName: "auth-table",
    });

    // Stores refresh token IDs
    const tokenDb = new DynamoStack(this, defaultId + "-tokenDb", {
      environment,
      tableName: "token-table",
    });

    // Stores businesses
    const businessDb = new DynamoStack(this, defaultId + "-businessDb", {
      environment,
      tableName: "business-table",
      stream: true,
    });

    // const apigateway = new FargateBackendStack(
    //   this,
    //   defaultId + "-fg-be-stack",
    //   {
    //     environment,
    //     serviceName: "backend",
    //     vpc: rootVPC.vpc,
    //     certificate: rootCertificate.certificate,
    //     zone: rootHostedZone.zone,
    //     domainName: "api." + this.domainName
    //   }
    // );

    // authDb.dbTable.grantReadWriteData(apigateway.service.taskDefinition.taskRole);

    const rootDlq = new sqs.Queue(this, defaultId + "-rootDlq", {
      queueName: defaultId + "-root-dlq",
    });

    // Api Gateway routes command events to different bounded contexts
    const businessQueue = new sqs.Queue(this, defaultId + "-businessQueue", {
      queueName: defaultId + "-business",
      deadLetterQueue: {
        queue: rootDlq,
        maxReceiveCount: 1,
      },
    });

    const sharedLayer = new lambda.LayerVersion(
      this,
      defaultId + "-shared-layer",
      {
        compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
        code: lambda.Code.fromAsset("../lambda/layers", {
          bundling: {
            image: lambda.Runtime.PYTHON_3_8.bundlingImage,
            command: [
              "bash",
              "-c",
              "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
            ],
          },
        }),
        layerVersionName: defaultId + "-shared-layer",
      }
    );

    const businessLambda = new lambda.Function(
      this,
      defaultId + "-business-lambda",
      {
        runtime: lambda.Runtime.PYTHON_3_8,
        handler: "lambda_handler.handler",
        code: lambda.Code.fromAsset(`../lambda/business`, {
          bundling: {
            image: lambda.Runtime.PYTHON_3_8.bundlingImage,
            command: [
              "bash",
              "-c",
              "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
            ],
          },
        }),
        functionName: defaultId + "-business",
        environment: {
          DYNAMODB_TABLE_NAME: businessDb.dbTable.tableName,
        },
        layers: [sharedLayer],
      }
    );

    businessDb.dbTable.grantReadWriteData(businessLambda);
    businessQueue.grantConsumeMessages(businessLambda);
    businessLambda.addEventSource(new SqsEventSource(businessQueue));
    // const lambdaFunction = new lambda.Function(this, 'LambdaFunction', {
    //   functionName: defaultId+`-businessCommandStream`,
    //   handler: 'index.handler',
    //   runtime: lambda.Runtime.NodeJS810,
    //   role: lambdaRole,
    //   code: new lambda.InlineCode(
    //     readFileContent(__dirname, 'resources/lambda/function.js'),
    //   ),
    // });

    // new lambda.EventSourceMapping(this, 'LambdaEventSourceMapping', {
    //   eventSourceArn: dynamodbTable.tableStreamArn,
    //   target: lambdaFunction,
    //   startingPosition: lambda.StartingPosition.Latest,
    // });
  }
}
