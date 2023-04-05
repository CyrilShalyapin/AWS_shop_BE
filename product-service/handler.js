const mock = require('./mock.json');
// import mock from './mock.json';
module.exports.getProductsList = async (event) => {
  try {
    const res = await Promise.resolve(mock);
    console.log('res', res);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(res),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: error.message })
    };
  }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.getProductsById = async (event) => {
  const id = event.pathParameters.id;
  const product = await Promise.resolve(mock.find(item => item.id === id));
  
  if (!product) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Product not found' })
    };
  }
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(product),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
