import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";

interface Props {
  environment: string;
  domainName: string;
}

/**
 *
 */
export class HostedZoneStack extends cdk.Construct {
  zone: route53.IHostedZone;
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    this.zone = route53.HostedZone.fromLookup(
      this,
      `${props.environment}-${props.domainName}-zone`,
      {
        domainName: props.domainName,
      }
    );
  }
}
