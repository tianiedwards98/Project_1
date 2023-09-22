const express = require('express');
const app = express();
const PORT = 3000;
const uuid = require('uuid');
//const userService = require('./servicelayer/userService');
const bodyParser = require('body-parser');
const userDao = require('./dao/userDAO');
const ticketDAO = require('./dao/ticketDao');

app.use(bodyParser.json());

function isEmptyObject(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }
//Login
app.post('/login/', async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    

    try {
        const user = await userDao.getUserDAO(username);
        if(user.Item == undefined){
            res.status(400).send('User does not exist');
        }else if(user.Item.Password !== password){
            res.status(400).send('Wrong Password');
        }else{
            if(user.Item.Admin == true){
                res.status(202).send('Manager');
            }else{
                res.status(202).send('Employee');
            }

        }
    } catch (error) {
        console.error(err);
        res.status(500).json({err: 'Something went wrong'});
    }
});
// Register User
app.post('/register', async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const admin = req.body.admin;
    const existingAccount = await userDao.getUserDAO(username);
try {
    if(isEmptyObject(existingAccount)){
        await userDao.registerUser(username,password,admin);
        res.status(201).send('Registered Successfully');
    }else if(!isEmptyObject(existingAccount)){
        res.status(400).send('Username unavailable');
    } 
} catch (error) {
    console.error(err);
    res.status(500).json({err: 'Something went wrong'});
}
  
    
});
// Submitted Ticket
app.post('/tickets', async (req,res) => {
    const ticket_id = uuid.v4();
    const author = req.body.author;
    const description = req.body.description;
    const type = req.body.type;
    const amount = req.body.amount;
    const status = "Pending";

    try {
        if(description == ""){
            res.status(400).send('Unable to submit without description');
        }else if(amount == null){
            res.status(400).send('Unable to submit without amount');
        }else{
             await ticketDAO.submitTicketDAO(ticket_id,author,description,type,amount,status);
            res.status(201).send('Successfully Submitted');
        } 
    } catch (error) {
        console.error(error);
        res.status(400).send('Something went wrong');
    }
});
// Update Status of Ticket
app.put('/tickets/update/:id',async (req,res) => {
    //add checks for invalid id, admin type
    const id = req.params.id;
    const decision = req.body.decision;
    const existingTicket = ticketDAO.getTicketByIdDAO(id);
    console.log(id)
    console.log(decision)

    if(isEmptyObject(existingTicket)){
        await ticketDAO.updateTicketDAO(id,decision);
        res.status(200).send('Successfully Updated')
    }else{
        res.status(400).send('Ticket Incorrect');
    }

});

app.get('/tickets/:id', async (req,res) => {
    const id = req.params.id
    console.log(id);
    try {
        const ticket = await ticketDAO.getTicketByIdDAO(id);
        res.status(200).json(ticket);
    } catch (error) {
        console.error(error);
        res.status(400).send('Something went wrong');
    }
});

//View Pending Tickets
app.get('/tickets', async (req,res) => {
    let pendingRequests = [];
    
    try {
        const tickets = await ticketDAO.retrieveAllTickets();
        for( let i = 0; i < tickets.Items.length; i++ ){
            if(tickets.Items[i].status == 'Pending'){
                pendingRequest.push(tickets.Items[i]);
            }
        }
        res.status(200).json(pendingRequests);
    } catch (error) {
        console.error(error);
        res.status(400).send('Something went wrong');
    }
})

//View Previous Submissions
app.get('/tickets/view-tickets/:id', (req,res) => {
console.log(req.params.id);
res.send('Hi');
});


app.listen(PORT, ()=> {
    console.log(`Server is running on port: ${PORT}`);
});