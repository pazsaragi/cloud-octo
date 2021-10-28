import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

interface Props {
  environment: string;
}

export class VPCStack extends cdk.Construct {
  vpc: ec2.Vpc;
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    this.vpc = new ec2.Vpc(scope, `${props.environment}-VPC`, {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "ingress",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "application",
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
      ],
    });
  }
}
