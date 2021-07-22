const express = require('express');
const app = express();
const path = require('path');
//const mongoose = require('mongoose');
const methodOverride = require('method-override');
const db = require('./database');

//const UserData = require('./models/data');
//const UserName = require('./models/username');

const years = ['FY', 'SY', 'TY', 'BE'];
const departments = ['Computer', 'IT', 'Mechanical', 'E&TC', 'Civil', 'FY'];

/*
mongoose.connect('mongodb://localhost:27017/data', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!");
    })
    .catch((err) => {
        console.log("MONGO CONNECTION ERROR!");
    })
*/

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/users/register', (req, res) => {
    res.render('users/register');
});

app.post('/users/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(`${username}  ${password}`);
    let queryUserRes;
    try {
        const queryUser = await db.promise().query(`SELECT * FROM usernames WHERE username='${username}'`);
        queryUserRes = queryUser[0];
        console.log(queryUserRes);
    } catch (error) {
        console.log(error);
    }
    
    //await UserName.findOne({ username: username });
    console.log(`queryUserRes.length = ${queryUserRes.length}`);
    if(queryUserRes.length !== 0) {
        res.render('users/userNameTaken');
        return;
    }

    //const newUser = new UserName(req.body);
    try {
        await db.promise().query(`INSERT INTO usernames VALUES('${username}', '${password}')`);
        console.log('User registeres successfully in usernames db');
    } catch (error) {
        console.log(error);
    }
   // await newUser.save();
   try {
       await db.promise().query(`INSERT INTO userdatas VALUES('${username}', UUID(), '', '', '', '')`);
   } catch (error) {
       console.log(error);
   }
    //const newData = new UserData({ userID: newUser._id });
   // await newData.save();
    res.redirect('/users/login');
});



app.get('/users/login', (req, res) => {
    res.render('users/login');
});

app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    //const checkUser = await UserName.findOne({ username: username });
    let checkUser;
    try {
        const checkUserQuery = await db.promise().query(`SELECT * FROM usernames WHERE username='${ username }'`);
        checkUser = checkUserQuery[0];
    } catch (error) {
        console.log(error);
    }

    
    if(checkUser.length === 0) {
        console.log('User not present');
        res.render('users/loginFailed');
    }
    else if (checkUser.length !== 0 && checkUser[0].password !== password) {
        console.log(checkUser);
        console.log(`database password = '${ checkUser.password }'`);
        console.log(`user password = '${ password }'`);
        console.log('Password incorrect');  
        res.render('users/loginFailed');
    }
    else if (checkUser.length !== 0 && checkUser[0].password === password) {
        const userQuery = await db.promise().query(`SELECT * FROM userdatas WHERE username='${ username }'`);
        const user = userQuery[0][0];
        console.log('Login Successful');
        res.redirect(`/users/${ user.id }`);
    }
    else {
        res.send('Implementation bug!!!');
    }

/*
    if(checkUser.length !== 0) {
        //const user = await UserData.findOne({userID: checkUser._id});
        const userQuery = await db.promise().query(``);
        if(!user) {
            console.log("Implementation problem! Username not present in UserData database!!!");
            res.render('users/loginFailed');
        }
        else if(user && password !== checkUser.password) {
            console.log("User found but password incorrect!!!");
            res.render('users/loginFailed');
        }
        else {
            console.log("Login successful!");
            console.log(`password: ${password}  checkUser.password: ${checkUser.password}`);
            res.redirect(`/users/${ user._id }`);
        }
    }
    */
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    //const user = await UserData.findById(id);
    let user;
    try {
        const userQuery = await db.promise().query(`SELECT * FROM userdatas WHERE id='${ id }'`);
        user = userQuery[0][0];
    } catch (error) {
        console.log(error);
    }

    res.render('users/show', { user });
});

app.get('/users/:id/edit', async (req, res) => {
    const { id } = req.params;
    //const user = await UserData.findById(id);
    let user;
    try {
        const userQuery = await db.promise().query(`SELECT * FROM userdatas WHERE id='${ id }'`);
        user = userQuery[0][0];
    } catch (error) {
        console.log(error);
    }
    
    res.render('users/edit', { info: { user: user, years: years, departments: departments } });
});

app.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    //await UserData.findByIdAndUpdate(id, req.body, { runValidators: true });
    const { name, year, department, phoneNumber } = req.body;
    try {
        await db.promise().query(`UPDATE userdatas SET name='${ name }', year='${ year }', department='${ department }', phoneNumber='${ phoneNumber }' WHERE id='${ id }'`);
    } catch (error) {
        console.log(error);
    }
    res.redirect(`/users/${ id }`);
});

app.get('/sandbox', (req, res) => {
    res.render('users/sandbox');
});


app.listen(8080);