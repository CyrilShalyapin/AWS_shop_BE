'use strict';
const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('../config.json');
const csv = require('csv-parser');

const importFileParser = async (event) => {
  const s3 = new AWS.S3();
  const sqs = new AWS.SQS();

  try {
    for (const record of event.Records) {
      const s3Stream = s3.getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      }).createReadStream();

      s3Stream
        .pipe(csv({ separator: ";" }))
        .on('data', data => {
          sqs.sendMessage({
            QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/946235596961/catalogItemsQueue',
            MessageBody: JSON.stringify(data),
          }, error => {
            if (error) {
              console.log('error', error);
            } else {
              console.log('message sent with data', data);
            }
          }).promise();
        })
        .on('error' , error => console.log(error))
        .on('end', () => console.log('record', record));

      await s3.copyObject({
        Bucket: BUCKET_NAME,
        CopySource: BUCKET_NAME + '/' + record.s3.object.key,
        Key: record.s3.object.key.replace('uploaded', 'parsed'),
      }).promise();

      await s3.deleteObject({
        Bucket: BUCKET_NAME,
        Key: record.s3.object.key,
      }).promise();
    }
  } catch (error) {
    console.error(error);
  }

  console.log('Files have been successfully parsed.', event);
};

module.exports = {
  handler: importFileParser,
};
