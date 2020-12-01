const db = require('../models/dbconnection');
const { encrypt, decrypt } = require('../lib/crypto');

function loginRoute(req, res) {

    
    const username = req.body.username,
        password = req.body.password;
    
	if (username && password) {
		db.query(
            'SELECT * FROM accounts WHERE username = ?', [ username, password ], 
            function(error, results, fields) {

                if (error) {
                    console.log('Error while logging in:', error);
                    res.json({ loggedIn: false, error });
                    return;
                }

                if (results.length === 0) res.json({ loggedIn: false, error: 'Incorrect Username and/or Password!' });

                results.forEach((user, index) => {

                    if (decrypt(JSON.parse(user.password)) === password) {

                        req.session.loggedIn = true;
                        req.session.username = username;
                        res.json({ username, hash: encrypt(results[0].id.toString()), loggedIn: true, error: false });

                    } else if (index === results.length - 1) {

                        res.json({ loggedIn: false, error: 'Incorrect Username and/or Password!' });
                    }
                });         
            }
        );
	} else {
		res.json({ loggedIn: false, error: 'Please enter Username and Password!' });
	}
}

function registerRoute(req, res) {

    const username = req.body.username,
        password = req.body.password;
    
	if (username && password) {
		db.query(
            'INSERT INTO accounts (username, password) VALUES(?, ?)', [ username, JSON.stringify(encrypt(password)) ],
            function(error, results, fields) {

                if (error) {
                    res.json({ loggedIn: false, error });
                    return;
                }

                res.json({ registration: true });         
            }
        );
	} else {
		res.json({ loggedIn: false, error: 'Please enter Username and Password!' });
	}
}

module.exports = {
    login: loginRoute,
    register: registerRoute
};