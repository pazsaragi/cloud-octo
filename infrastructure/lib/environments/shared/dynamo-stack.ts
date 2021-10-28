import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { IS_DEV, IS_TEST } from "../../../constants";

interface Props {
  tableName: string;
  environment: string;
}

export class DynamoStack extends cdk.Construct {
  dbTable: dynamodb.Table;
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    // DynamoDB Table
    this.dbTable = new dynamodb.Table(this, `${props.environment}-${props.tableName}-table`, {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      removalPolicy:
        IS_DEV || IS_TEST
          ? cdk.RemovalPolicy.DESTROY
          : cdk.RemovalPolicy.RETAIN,
      tableName: props.tableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
    });

    cdk.Tags.of(this.dbTable).add("environment", props.environment);
  }
}
