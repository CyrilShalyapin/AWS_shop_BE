'use strict';
const AWS = require('aws-sdk');
const { headers } = require('./constants');
const { BUCKET_NAME } = require('../config.json');

const importProductsFile = async () => {
  const s3 = new AWS.S3();
  let statusCode = 200;
  let body = {};
  let files = [];
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: 'uploaded/',
  };

  try {
    const response = await s3.listObjectsV2(params).promise();
    console.log('response', response);
    files = response.Contents;
    body = JSON.stringify(
      files
        .filter(file => file.Size)
        .map(file => `https://${ BUCKET_NAME }.s3.amazonaws.com/${ file.Key }`)
    );
  } catch (error) {
    console.error(error);
    statusCode = 500;
    body = error;
  }

  return {
    statusCode,
    headers,
    body,
  };
};

module.exports = {
  handler: importProductsFile,
};
