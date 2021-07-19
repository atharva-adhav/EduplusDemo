const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const UserData = require('./models/data');
const UserName = require('./models/username');

const years = ['FY', 'SY', 'TY', 'BE'];
const departments = ['Computer', 'IT', 'Mechanical', 'E&TC', 'Civil', 'FY'];

mongoose.connect('mongodb://localhost:27017/data', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!");
    })
    .catch((err) => {
        console.log("MONGO CONNECTION ERROR!");
    })

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/users/register', (req, res) => {
    res.render('users/register');
});

app.post('/users/register', async (req, res) => {
    const { username } = req.body;
    const queryUser = await UserName.findOne({ username: username });
    if(queryUser) {
        res.render('users/userNameTaken');
    }

    const newUser = new UserName(req.body);
    await newUser.save();
    const newData = new UserData({ userID: newUser._id });
    await newData.save();
    res.redirect('/users/login');
});



app.get('/users/login', (req, res) => {
    res.render('users/login');
});

app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    const checkUser = await UserName.findOne({ username: username });
    if(!checkUser) {
        res.render('users/loginFailed');
    }
    else {
        const user = await UserData.findOne({userID: checkUser._id});
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
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    const user = await UserData.findById(id);
    res.render('users/show', { user });
});

app.get('/users/:id/edit', async (req, res) => {
    const { id } = req.params;
    const user = await UserData.findById(id);
    res.render('users/edit', { info: { user: user, years: years, departments: departments } });
});

app.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    await UserData.findByIdAndUpdate(id, req.body, { runValidators: true });
    res.redirect(`/users/${ id }`);
});


app.listen(8080);