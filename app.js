//Databases
//import mysql from 'mysql2';
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'online_shop'
}).promise();


//Registration
async function addUser(username, email, password){
  const result = await pool.query('insert into users (username, email, passwd) values (?,?,?)',
     [username, email, password]);
  return result;
}

//Login
async function getUsers(username, password){
  const [rows] = await pool.query
  ("select username, passwd from users where (username, passwd) = (?,?)", 
    [username, password]);
  
  if(rows.length != 1){
    //console.log("Lypa");
    return false;
  }
  else{
    //console.log("Jest dobrze");a
    return rows;
  }

}

// IMPORTS

const express = require('express');
const path = require('path');
const session = require('express-session');

// SETUP
const port = 3000;
const app = express();

app.use(session({
    secret: 'kjw534njksdfj',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: true,
        // secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 100 * 60 * 60
    }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());

// CONST VARIABLES

const nav_html_basic = `
    <nav class="main-nav">
        <div class="nav-item">
            <a class="nav-link" href="/main">Home</a>
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/about">About</a>
        </div>
        <div class="nav-item">
            <input class="nav-search" type="text" placeholder="Search.." inputmode="search">
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/login">Log in</a>
        </div>
    </nav>
`

const nav_html_logged = `
    <nav class="main-nav">
        <div class="nav-item">
            <a class="nav-link" href="/main">Home</a>
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/about">About</a>
        </div>
        <div class="nav-item">
            <input class="nav-search" type="text" placeholder="Search.." inputmode="search">
        </div>
        <div class="nav-item">
            <div class="nav-drop">
                <a class="nav-link" href="/account">Account</a>
                <div class="nav-drop-content">
                    <a class="nav-drop-link" href="">change</a>
                    <a class="nav-drop-link" href="/log-out">log out</a>
                    <a class="nav-drop-link" href="/basket">basket</a>
                </div>
            </div>
        </div>
    </nav>
`
const usr_db = [
    {id: 1, username: 'max', password: '1234', role: 'admin'},
    {id: 1, username: 'alex', password: '1234', role: 'user'}
];

// DYNAMIC ELEMENTS

app.get('/load-nav', (req, res) => {
    res.header("Content-Type",'application/json');
    if(req.session.userId) {
        res.send(nav_html_logged);
    } else {
        res.send(nav_html_basic);
    }
});

// VIEWS NAVIGATION

app.get('/', (req, res) => {
    res.render('main.ejs');
});

app.get('/main', (req, res) => {
    res.redirect('/');
});

app.get('/about', (req, res) => {
    res.render('about.ejs');
});

app.get('/product', (req, res) => {
    res.render('product.ejs');
});

// LOGIN & AUTHENTICATION

app.get('/log-out', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            // TODO: think of a better sollution
            return res.status(500).json({message: 'Logout failed!'});
        }
        // res.json({message: 'Logged out successfully!'});
    });
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 1. Check database
  const user = await getUsers(username, password);

  // 2. Logic based on result
  if (user) {
      // SUCCESS: Save to session
      req.session.user = {
          id: user.id,
          username: user.username
      };
      console.log("Logged in successfully!");
      return res.redirect('/main'); // Redirect to main as requested
  } else {
      // FAILURE: Render login page with error message
      console.log("Login failed");
      return res.render('login.ejs', { error: 'Bad login or password' });
  }
});

// ACCOUNT CREATION

app.get('/create-account', (req, res) => {
    res.render('create-account.ejs');
});

/*
app.post('/create-account', (req, res) => {
    const {username, password} = req.body;
    // TODO: add to real DB

    next_id = Object.keys(usr_db).length + 1;
    usr_db.push({id: next_id, 'username': username, 'password': password});
    res.redirect('/login');
});
*/

app.post('/create-account', async (req, res) => {
  const name = req.body.username;
  //const email = req.body.email;
  const passwd = req.body.password;

  addUser(name, "", passwd);

  //res.send(`Password = ${passwd}`);
  return res.redirect('/login');
});

// BASKET + CARD

app.get('/basket', (req, res) => {
    // TODO: add price based on data from DB and quantity
    // TODO: apply check for available quantity one more time
    res.render('basket.ejs');
});

app.post('/cart', (req, res) => {
    // TODO: check max quantity in DB & if requested is over it react with some browser message
    if(!req.session.cart) {
        req.session.cart = [];   
    }
    req.session.cart.push(req.body);
    console.log(req.session.cart);
    // res.json(req.session.cart);
    res.sendStatus(200);
});

// SERVER

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something weng wrong!');
});

// app.get("/check", (req, res) => {
//     res.header("Content-Type",'application/json');
//     if(req.session.id) {
//         res.send(JSON.stringify(true));
//     } else {
//         res.send(JSON.stringify(false));
//     }
// });

