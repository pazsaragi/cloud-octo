import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";

interface Props {
  zone: route53.IHostedZone;
  environment: string;
  domainName: string;
  subDomain?: string;
  region?: string;
}

/**
 * Stack responsible for creating acm certificates
 */
export class CertificateStack extends cdk.Construct {
  certificate: acm.ICertificate;
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    const domainName = props?.subDomain
      ? `${props.subDomain}.${props.domainName}`
      : props.domainName;
    console.log("Domain name ... ", domainName);

    // Create Certificate
    this.certificate = new acm.DnsValidatedCertificate(
      this,
      `${props.environment}-${props.domainName}`,
      {
        domainName,
        hostedZone: props.zone,
        region: props.region || "us-east-1",
        //This is needed especially for certificates used for CloudFront distributions,
        //which require the region to be us-east-1.
      }
    );
  }
}
