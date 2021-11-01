import AWS from "aws-sdk";
import { ENV } from "./constants";
import { returnErrorDataObject } from "./utils";

AWS.config.update({
    region: process.env.AWS_REGION || 'eu-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const db = new AWS.DynamoDB();
export const queue = new AWS.SQS();

export const businessQueueUrl = queue.getQueueUrl({
    QueueName: ENV+'-business', /* required */
    QueueOwnerAWSAccountId: process.env.AWS_ACCOUNT_ID
  })
  .promise()
  .then(url => url.QueueUrl)
  