import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudFront from "@aws-cdk/aws-cloudfront";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as targets from "@aws-cdk/aws-route53-targets";

interface Props {
  environment: string;
  domainName: string;
  siteCertificateArn: string;
  zone: route53.IHostedZone;
}

/**
 * https://github.com/aws-samples/multidomain-spa-with-cdk-and-cloudfront/blob/main/lib/wildCardStaticApp-stack.ts
 * Static site infrastructure, which deploys site content to an S3 bucket.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 */
export class WebAppStack extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);
    const defaultId = `${props.environment}`;

    /*
      Use the name of a Route53 hosted zone that exists in your account, replace 
      exampledomain with your Hostedzone
    */
    const subDomain = `*.${props.domainName}`;
    const appSpecificSubdomain = `app.${props.domainName}`;

    // Add S3 Bucket
    const s3Site = new s3.Bucket(this, defaultId + `-s3site`, {
      bucketName: `${props.environment.toLowerCase()}${props.domainName}`,
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    this.enableCorsOnBucket(s3Site);

    // Create access identity, and grant read access only, we will use this identity in CloudFront
    const originAccessIdentity = new cloudFront.OriginAccessIdentity(
      this,
      "OIA",
      {
        comment: "Setup access from CloudFront to the bucket ( read )",
      }
    );
    s3Site.grantRead(originAccessIdentity as any);
    // Create a new CloudFront Distribution
    const distribution = new cloudFront.CloudFrontWebDistribution(
      this,
      defaultId + `-cf-distribution`,
      {
        aliasConfiguration: {
          acmCertRef: props.siteCertificateArn,
          names: [subDomain],
          securityPolicy: cloudFront.SecurityPolicyProtocol.TLS_V1_2_2019,
        },
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: s3Site as any,
              originAccessIdentity: originAccessIdentity,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                compress: true,
                allowedMethods: cloudFront.CloudFrontAllowedMethods.ALL,
                cachedMethods:
                  cloudFront.CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
                forwardedValues: {
                  queryString: true,
                  cookies: {
                    forward: "none",
                  },
                  headers: [
                    "Access-Control-Request-Headers",
                    "Access-Control-Request-Method",
                    "Origin",
                  ],
                },
              },
            ],
          },
        ],
        comment: `myreactapp - CloudFront Distribution`,
        viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      }
    );

    //Create A Record Custom Domain to CloudFront CDN
    new route53.ARecord(this, defaultId + "-webapp-a", {
      recordName: appSpecificSubdomain,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution as any) as any
      ),
      zone: props.zone,
    });

    // Setup Bucket Deployment to automatically deploy new assets and invalidate cache
    new s3deploy.BucketDeployment(this, defaultId + `-s3bucketdeployment`, {
      sources: [s3deploy.Source.asset("../ui/web/out")],
      destinationBucket: s3Site as any,
      distribution: distribution,
      distributionPaths: ["/*"],
    });

    // Final CloudFront URL
    new cdk.CfnOutput(this, "CloudFront URL", {
      value: distribution.distributionDomainName,
    });
  }

  /**
   * Enables CORS access on the given bucket
   *
   * @memberof CxpInfrastructureStack
   */
  enableCorsOnBucket = (bucket: s3.IBucket) => {
    const cfnBucket = bucket.node.findChild("Resource") as s3.CfnBucket;
    cfnBucket.addPropertyOverride("CorsConfiguration", {
      CorsRules: [
        {
          AllowedOrigins: ["*"],
          AllowedMethods: ["HEAD", "GET", "PUT", "POST", "DELETE"],
          ExposedHeaders: [
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2",
          ],
          AllowedHeaders: ["*"],
        },
      ],
    });
  };
}
