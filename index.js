const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const db = require('./database');


const years = ['FY', 'SY', 'TY', 'BE'];
const departments = ['Computer', 'IT', 'Mechanical', 'E&TC', 'Civil', 'FY'];

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
    
    console.log(`queryUserRes.length = ${queryUserRes.length}`);
    if(queryUserRes.length !== 0) {
        res.render('users/userNameTaken');
        return;
    }

    try {
        await db.promise().query(`INSERT INTO usernames VALUES('${username}', '${password}')`);
        console.log('User registeres successfully in usernames db');
    } catch (error) {
        console.log(error);
    }
   try {
       await db.promise().query(`INSERT INTO userdatas VALUES('${username}', UUID(), '', '', '', '')`);
   } catch (error) {
       console.log(error);
   }
    res.redirect('/users/login');
});



app.get('/users/login', (req, res) => {
    res.render('users/login');
});

app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
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
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
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
    const { name, year, department, phoneNumber } = req.body;
    try {
        await db.promise().query(`UPDATE userdatas SET name='${ name }', year='${ year }', department='${ department }', phoneNumber='${ phoneNumber }' WHERE id='${ id }'`);
    } catch (error) {
        console.log(error);
    }
    res.redirect(`/users/${ id }`);
});

app.listen(8080);