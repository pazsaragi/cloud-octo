import * as cdk from "@aws-cdk/core";
import { VPCStack } from "../shared/vpc";
import { HostedZoneStack } from "../shared/hostedzone-stack";
import { CertificateStack } from "../shared/certificate-stack";
import { FargateBackendStack } from "../shared/fargate-backend-stack";
import { DynamoStack } from "../shared/dynamo-stack";

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
    const authDb = new DynamoStack(this, defaultId+"-authDb", {
      environment,
      tableName: 'auth-table'
    });
    
    const apigateway = new FargateBackendStack(
      this,
      defaultId + "-fg-be-stack",
      {
        environment,
        serviceName: "backend",
        vpc: rootVPC.vpc,
        certificate: rootCertificate.certificate,
        zone: rootHostedZone.zone,
        domainName: "api." + this.domainName
      }
    );

    authDb.dbTable.grantReadWriteData(apigateway.service.taskDefinition.taskRole);
  }
}
