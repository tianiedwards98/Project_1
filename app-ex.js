const express = require('express');
const app = express();
const PORT = 3000;
const uuid = require('uuid');
//const userService = require('./servicelayer/userService');
const bodyParser = require('body-parser');
const userDao = require('./dao/userDAO');

app.use(bodyParser.json());

function isEmptyObject(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }
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
            res.status(200).send('Login Successful');
        }
    } catch (error) {
        console.error(err);
        res.status(500).json({err: 'Something went wrong'});
    }
});

app.post('/register', async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const admin = req.body.admin;
    const existingAccount = await userDao.getUserDAO(username);
try {
    if(isEmptyObject(existingAccount)){
        await userDao.registerUser(username,password,admin);
        res.status(200).send('Registered Successfully');
    }else if(!isEmptyObject(existingAccount)){
        res.status(400).send('Username unavailable');
    } 
} catch (error) {
    console.error(err);
    res.status(500).json({err: 'Something went wrong'});
}
  
    
});

app.listen(PORT, ()=> {
    console.log(`Server is running on port: ${PORT}`);
});