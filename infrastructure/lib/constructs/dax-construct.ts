import * as cdk from "@aws-cdk/core";
import * as dax from "@aws-cdk/aws-dax";

interface Props {
  clusterName: string;
  environment: string;
}

export class DAXConstruct extends cdk.Construct {
  dax: dax.CfnCluster;
  /**
   *
   *
   */

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);
    const defaultId = `${props.environment}-${props.clusterName}`;

    // this.dax = new dax.CfnCluster(this, defaultId, {
    //   iamRoleArn: "",
    //   nodeType: "",
    //   replicationFactor: 1,
    // });
  }
}
