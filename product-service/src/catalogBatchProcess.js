'use strict'
const { v4 } = require('uuid');
const AWS = require('aws-sdk');
const { headers } = require('./utils');

const catalogBatchProcess = async event => {
  const dynamo = new AWS.DynamoDB.DocumentClient();
  const sns = new AWS.SNS();
  console.log('event.Records', event.Records);
  try {
    for (const record of event.Records) {
      const { count: textCount, description, price: textPrice, title } = JSON.parse(record.body);
      const count = +textCount;
      const price = +textPrice;
      const id = v4();

      console.log('product', { count, description, id, price, title });

      await dynamo.put({
        TableName: 'products',
        Item: { description, id, price, title },
      }).promise();

      await dynamo.put({
        TableName: 'stocks',
        Item: { count, id },
      }).promise();

    };

    sns.publish({
      Subject: 'New products were created',
      Message: {
        count: event.Records.length,
        status: 200,
      },
      TopicArn: process.env.SNS_ARN,
    }, () => {
      console.log('SNS mesange sent');
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ count, description, id, price, title }),
    };
  } catch (error) {
    sns.publish({
      Subject: 'Failed to create new products',
      Message: {
        status: 500,
      },
      TopicArn: process.env.SNS_ARN,
    }, () => {
      console.log('SNS mesange sent');
    }).promise();

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

module.exports = {
  handler: catalogBatchProcess,
};
