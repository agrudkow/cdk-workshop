import { APIGatewayProxyHandler } from 'aws-lambda';
import { Lambda, DynamoDB } from 'aws-sdk';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('request', JSON.stringify(event, undefined, 2));

  const dynamoDBClient = new DynamoDB();
  const lambdaClient = new Lambda();

  await dynamoDBClient
    .updateItem({
      TableName: process.env.HITS_TABLE_NAME as string,
      Key: { path: { S: event.path } },
      UpdateExpression: 'ADD hits :incr',
      ExpressionAttributeValues: { ':incr': { N: '1' } },
    })
    .promise();

  const resp = await lambdaClient
    .invoke({
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME as string,
      Payload: JSON.stringify(event),
    })
    .promise();

  console.log(`downstream response: `, JSON.stringify(resp, undefined, 2));

  return JSON.parse(resp.Payload?.toString() || '');
};
