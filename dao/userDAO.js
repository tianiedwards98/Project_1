const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

function getUserDAO(Username){
    const params = {
        TableName: 'Users',
       Key: {
        Username
       }
    }
    return docClient.get(params).promise();

}

function registerUser (Username, Password, Admin){
    const params = {
        TableName: 'Users',
        Item: {
            Username,
            Password,
            Admin
        },
        
    }
    return docClient.put(params).promise();
}

module.exports = {registerUser,getUserDAO};