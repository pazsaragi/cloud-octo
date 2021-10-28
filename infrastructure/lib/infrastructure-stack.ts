import * as cdk from "@aws-cdk/core";
import { checkEnvVars } from "../utils/checkEnvVars";
import { DevStack } from "./environments/dev/dev-stack";
export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = "ENV";
    const key = "AWS_ACCESS_KEY_ID";
    const secret = "AWS_SECRET_ACCESS_KEY";

    console.log(`Environment is ${process.env.ENV}`);
    checkEnvVars([environment]);

    switch (process.env.ENV) {
      case "DEV":
        checkEnvVars([secret, key]);
        new DevStack(this, "DevStack", {});
        break;
      case "TEST":
        // 
        break;
      case "PROD":
        // 
        break;
      default:
        break;
    }
  }
}
