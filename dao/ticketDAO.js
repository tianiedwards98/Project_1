const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

function submitTicketDAO(ticket_id,author,description,type,amount,status){
    const params = {
        TableName: 'Tickets',
        Item: {
            ticket_id,
            author,
            description,
            type,
            amount,
            status
        },
        
    }
    return docClient.put(params).promise();
}

function updateTicketDAO(ticket_id, decision){
    const params = {
        TableName: 'Tickets',
        Key: {
            ticket_id
        },
        UpdateExpression: 'set #s = :r',
        ExpressionAttributeValues: {
            ':r': decision,
        },
        ExpressionAttributeNames: {
            "#s": "status"
        }
    };
    return docClient.update(params).promise();
}
function getTicketByIdDAO(ticket_id){
    const params = {
        TableName: 'Tickets',
        Key: {
            ticket_id
        }
    }
    return docClient.get(params).promise();
}
function retrieveAllTickets(){
    const params = {
        TableName: 'Tickets'
    }
    return docClient.scan(params).promise();
}
module.exports = {submitTicketDAO, updateTicketDAO, getTicketByIdDAO,retrieveAllTickets};