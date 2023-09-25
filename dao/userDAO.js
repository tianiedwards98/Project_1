const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

function retrieveUser(username){
    const params = {
        TableName: 'Users',
       Key: {
        username
       }
    }
    return docClient.get(params).promise();

}

function registerUser (username,password,role){
    const params = {
        TableName: 'Users',
        Item: {
            username,
            password,
            role
        },
        
    }
    return docClient.put(params).promise();
}

module.exports = {registerUser,retrieveUser};