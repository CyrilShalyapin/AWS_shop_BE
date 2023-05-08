const basicAuthorizer = async (event, _ctx, cb) => {
  console.log('event', event);
  if (event['type'] !== 'REQUEST') {
    cb('Unautherized');
  }

  try {
    const encodedCreds = event.headers.Authorization.replace('Basic ', '');
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const username = plainCreds[0];
    const password = plainCreds[1];

    console.log('username:', username);
    console.log('password:', password);

    const storedUserPassword = process.env[username];
    const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    cb(null, policy);
  } catch (error) {
    cb(`Unautherized: ${error.message}`);
  }
};

const generatePolicy = (principalId, resource, effect = 'Allow') => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};

module.exports = {
  handler: basicAuthorizer,
};
