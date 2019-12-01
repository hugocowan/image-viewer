require('dotenv').config();
const router = require('./config/router.js');
const port = process.env.REACT_APP_API_PORT || 5001;
const session = require('express-session');
const express = require('express');
const app = express();

app.use(session({
	secret: process.env.SECRET,
	resave: true,
	saveUninitialized: true
}));

// app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.use(function(req, res, next) {
    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
        //respond with 200
        res.sendStatus(200);
    }
    else {
        //move on
        next();
    }
});

app.use('/media', express.static(`${__dirname}/src/assets`));
app.use('/api', router);

app.get('/*', (req, res) => res.sendFile(`${__dirname}/public/index.html`));

app.listen(port, () => console.log(`Listening on port ${port}`));