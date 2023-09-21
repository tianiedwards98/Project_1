const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

function submitTicketDAO(ticket_id,author,description,type,amount){
    const params = {
        TableName: 'Tickets',
        Item: {
            ticket_id,
            author,
            description,
            type,
            amount
        },
        
    }
    return docClient.put(params).promise();
}

module.exports = {submitTicketDAO};