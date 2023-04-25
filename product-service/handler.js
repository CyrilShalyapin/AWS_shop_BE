const { v4 } = require('uuid');
const AWS = require('aws-sdk');

const headers = {
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Origin': '*'
};

module.exports.getProductsList = async (event) => {
  console.log(event);
  try {
    const dynamo = new AWS.DynamoDB.DocumentClient();
    const { Items: products } = await dynamo.scan({ TableName: 'products' }).promise();
    const { Items: stocks } = await dynamo.scan({ TableName: 'stocks' }).promise();
    const joined = products.map((product, index) => {
      const { count } = stocks[index];
      return {...product, count};
    });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(joined),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

module.exports.getProductById = async (event) => {
  console.log(event);
  try {
    const dynamo = new AWS.DynamoDB.DocumentClient();
    const id = event.pathParameters.id;
    const { Item: product } = await dynamo.get({
      TableName: 'products',
      Key: { id },
    }).promise();
    const { Item: stock } = await dynamo.get({
      TableName: 'stocks',
      Key: { id },
    }).promise();
    
    if (!product) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ count: stock.count, ...product }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

module.exports.createProduct = async event => {
  console.log(event);
  try {
    const dynamo = new AWS.DynamoDB.DocumentClient();
    const { count, description, price, title } = JSON.parse(event.body);

    if ((!count || typeof count !== 'number') ||
      (!description || typeof description !== 'string') ||
      (!price || typeof price !== 'number') ||
      (!title || typeof title !== 'string')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Product Data Is Invalid' }),
      };
    }
    const id = v4();

    await dynamo.put({
      TableName: 'products',
      Item: { description, id, price, title },
    }).promise();
  
    await dynamo.put({
      TableName: 'stocks',
      Item: { count, id },
    }).promise();
  
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ count, description, id, price, title }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

module.exports.catalogBatchProcess = () => {
  console.log('here goes function');
};
