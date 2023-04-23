'use strict';
const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('../config.json');
const csv = require('csv-parser');

const importFileParser = async (event) => {
  const s3 = new AWS.S3();
  console.log('event', event);

  try {
    for (const record of event.Records) {

      const s3Stream = s3.getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      }).createReadStream();

      s3Stream
        .pipe(csv({ separator: ";" }))
        .on('data', data => console.log('parsed data', data))
        .on('error', error => console.error(error))
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
