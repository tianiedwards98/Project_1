const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

function submitTicketDAO(username,ticket_id,description,amount,status){
    const params = {
        TableName: 'Tickets',
        Item: {
            username,
            ticket_id,
            description,
            amount,
            status
        },
        
    }
    return docClient.put(params).promise();
}

function updateTicketDAO(ticket_id, status, resolver){
    const params = {
        TableName: 'Tickets',
        Key: {
            ticket_id
        },
        UpdateExpression: 'set #s = :status, #r =  :resolver',
        ConditionExpression: 'attribute_exists(ticket_id) AND #s = :pending',
        ExpressionAttributeNames: {
            '#s': 'status',
            '#r': 'resolver'
        },
        ExpressionAttributeValues: {
            ':status': status,
            ':resolver': resolver,
            ':pending': "Pending"
        }
    }
    return docClient.update(params).promise();
}

function retrievePreviousTicketsByUser(username){
    const params = {
        TableName: 'Tickets',
        FilterExpression: '#username = :username',
        ExpressionAttributeValues: { ':username': username},
        ExpressionAttributeNames: {'#username': 'username'}
    }
    return docClient.scan(params).promise();
}

function retrieveTicketById(ticket_id){
    const params = {
        TableName: 'Tickets',
       Key: {
        ticket_id
       }
    }
    docClient.get(params).promise();
}

function retrievePendingTickets(){
    const params = {
        TableName: 'Tickets',
        FilterExpression: '#s = :status',
        ExpressionAttributeValues: { ':status':'Pending'},
        ExpressionAttributeNames: {'#s': 'status'}

    }
    return docClient.scan(params).promise();
}
module.exports = {submitTicketDAO, updateTicketDAO,retrievePreviousTicketsByUser,retrievePendingTickets,retrieveTicketById};