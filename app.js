const express = require('express');
const app = express();
const PORT = 3000;
const jwtUtil = require('./utility/jwt_util');
const uuid = require('uuid');
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
app.post('/login', (req,res) => {
    const username = req.body.username;
    const password  = req.body.password;

    console.log(username);

    userDao.retrieveUser(username)
    .then((data) => {
        const userItem = data.Item;

        if(password === userItem.password){
            //successful login
            //create jwt
            const token = jwtUtil.createJWT(userItem.username,userItem.role);
            res.send({
                message: 'Successfully Authenticated',
                token: token
            })
        }else{
            res.statusCode = 400
            res.send({
                message: "Invalid Credentials"
            })
        }
    })
    .catch((err) => {
        console.error(err);
        res.send({
            message: "Failed to authenticate user"
        });
    });
});

//Employee endpoint
app.get('/endpointforemployeesonly', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];

    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {

            if(payload.role === 'employee'){
                res.send({
                    message: `Welcome Employee ${payload.username}`
                })
            }else{
                res.statusCode = 401;
                res.send({
                    message: `You are not an employee, you are a ${payload.role}`
                })
            }
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 401;
            res.send({
                message: "Failed to Authenticate Token"
            })
        })
})
//Admin EndPoint
app.get('/endpointforadminsonly', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    console.log(token);
    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {

            if(payload.role === 'admin'){
                res.send({
                    message: `Welcome Admin ${payload.username}`
                })
            }else{
                res.statusCode = 401;
                res.send({
                    message: `You are not an admin, you are a ${payload.role}`
                })
            }
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 401;
            res.send({
                message: "Failed to Authenticate Token"
            })
        })
})

// Register User
app.post('/register', async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const admin = req.body.role;
    const existingAccount = await userDao.retrieveUser(username);

    userDao.registerUser(username,password,admin)
    .then((data) => {
        if(isEmptyObject(existingAccount)){
        res.status(201).send({
            message: 'Successfully Registered'
        })
        }else{
            res.status(400).send({
                message: 'Username Unavailable'
            })
        }
    }).catch((err)=> {
        if(err.code == 'ConditionalCheckFailedException'){
            res.status(400).send({
                message:'Duplicate'
            })
        }else{
        console.error(err);
        res.status(500).send({message: 'Something went wrong'});
        } 
    })
});
// Submitted Ticket
app.post('/tickets', (req,res) => {
    const ticket_id = uuid.v4();
    const description = req.body.description;
    const amount = req.body.amount;
    const status = "Pending";

    const token = req.headers.authorization.split(' ')[1];
    jwtUtil.verifyTokenAndReturnPayload(token)
    .then((payload) => {
        if(payload.role === 'employee'){
            if(description == ""){
                res.status(400).send({
                    message: 'Unable to submit without description'
                });
            }else if(amount == null){
                res.status(400).send({
                    message: 'Unable to submit without amount'
                });
            }else{
                ticketDAO.submitTicketDAO(payload.username,ticket_id,description,amount,status)
                .then((data)=> {
                        res.status(201).send({
                        message: 'Successfully Submitted',
                        ticket_number: ticket_id
                        });
                    }) .catch((err)=> {
                    console.error(err);
                    res.status(400).send({
                        message:'Something went wrong'
                    });
                })
            }
        }else{
            res.status(403).send({
                message: `You are not an Employee, you are an Admin`
            });
        }
    
    }).catch((err)=> {
        console.error(err);
        res.statusCode(401).send({
            message: "Failed to Authenticate Token"
        })
    })
   

});
// Update Status of Ticket - needs to be completed
app.put('/tickets/update/:id',async (req,res) => {
    //add checks for invalid id, admin type
    const processed = false;
    const id = req.params.id;
    const decision = req.body.status;
    //const existingTicket = ticketDAO.retrieveTicketById(id)
    console.log(id)
    console.log(decision)
    const token = req.headers.authorization.split(' ')[1];
    //console.log(existingTicket);
    // if(existingTicket.Item.status == 'Approved' || existingTicket.Item.status == 'Denied'){
    //     processed = true;
    // }

    jwtUtil.verifyTokenAndReturnPayload(token)
    .then((payload)=> {
        if(payload.role == 'admin'){
            if(processed == true){
                res.status(403).send({
                    message: 'Cannot change has already been decisioned'
                })
            }else{
                    ticketDAO.updateTicketDAO(id,decision,payload.username)
                    .then((data)=> {
                        res.status(200).send({
                            message:'Successfully Updated', 
                            data: data.Item  
                        })
                    }).catch((err) => {
                        res.status(403).send({
                            message: 'Ticket has already been decisioned'
                        })
                    }) 
            }
        }else{
            res.status(403).send({
                message: 'You are an Employee, not an Admin'
            })
        }
        
    }).catch((err)=> {
        console.error(err);
        res.status(401).send({
            message: "Failed to Authenticate Token"
        })
    })
   
});
//View Pending Tickets
app.get('/pendingTickets', (req,res) => {

    const token = req.headers.authorization.split(' ')[1];
    jwtUtil.verifyTokenAndReturnPayload(token)
    .then((payload)=> {
        if(payload.role === 'admin'){
            ticketDAO.retrievePendingTickets()
            .then((data) => {
                res.status(200).send(data.Items)
            }).catch((err) => {
                console.error(err);
                res.status(400).send({
                    message: 'Something went wrong'
                });
            })
        }else{
            res.status(403).send({
                message: `You are not an Admin, you are an Employee`
            });
        }
    }).catch((err)=> {
        console.error(err);
        res.statusCode(401).send({
            message: "Failed to Authenticate Token"
        })
    })
    
})

//View Previous Submissions
app.get('/previoustickets/', (req,res) => {
//const username = req.params.username;
//console.log(username);

 const token = req.headers.authorization.split(' ')[1];
 jwtUtil.verifyTokenAndReturnPayload(token)
 .then((payload) => {
    if(payload.role === 'employee'){
        ticketDAO.retrievePreviousTicketsByUser(payload.username)
        .then((data)=> {
            console.log(data);
            res.status(200).send(data);
        }).catch((err)=> {
            console.error(err);
            res.status(400).send('Something went wrong');
        });
    }else{
        res.status(403).send({
            message: 'You are an Admin, not an Employee'
        })
    }
 })



});


app.listen(PORT, ()=> {
    console.log(`Server is running on port: ${PORT}`);
});