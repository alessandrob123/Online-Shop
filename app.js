//Databases
//import mysql from 'mysql2';
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'online_shop'
}).promise();


//logowanie w bazie danych
async function addUser(username, email, password){
  const result = await pool.query('insert into users (username, email, passwd) values (?,?,?)',
     [username, email, password]);
  return result;
}

//rejestracja w bazie danych
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

const express = require('express');
const path = require('path');
const session = require('express-session');
// const bodyParser = require('body-parser');


const usr_db = [
    {id: 1, username: 'Whistler', password: 'my voice is my password'}
];
const port = 3000;

const app = express();

app.use(session({
    secret: 'kjw534njksdfj',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60} // 1h
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'))

// app.use(bodyParser.urlencoded({
//     extended: true
// }));

// pewnie wysylanie json zamowien, ale tu sie upewnic

// zrozumiec czemu express.urlencoded działa
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.render('main.ejs');
});

app.get('/main', (req, res) => {
    res.redirect('/');
});

app.get('/product', (req, res) => {
    res.render('product.ejs');
});

app.get('/about', (req, res) => {
    res.render('about.ejs');
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



/*
app.post('/login', (req, res) => {
    console.log(req.body);
    const {username, password} = req.body;
    const user = usr_db.find(u => u.username==username && u.password==password);

    if(!user) {
        return res.status(401).json({message: 'Invalid credentials'});
    }

    req.session.user = {
        id: user.id,
        // id should be generated and saved in db - here is accessed
        username: user.username
    };

    // zrozumiec co tu sie dzieje
    res.json({message: 'Login successful', user: req.session.user});
});
*/


// byloby spoko gdyby log out sie pokazalo po zalogowaniu
// przypomniec sobie req + zobaczyc te komunikaty, zrozumiec czym jest session
// moze dodac profile
// input type=submit zamiast button???
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})




