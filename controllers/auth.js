const db = require('../models/dbconnection');

function loginRoute(req, res) {

    
    const username = req.body.username,
        password = req.body.password;
    
	if (username && password) {
		db.query(
            'SELECT * FROM accounts WHERE username = ? AND password = ?', [ username, password ], 
            function(error, results, fields) {

                if (error) {
                    console.log('Error while logging in:', error);
                    res.json({ loggedIn: false, error });
                    return;
                }

                if (results.length > 0) {

                    req.session.loggedIn = true;
                    req.session.username = username;
                    res.json({ username, id: results[0].id, loggedIn: true, error: false });

                } else {

                    res.json({ loggedIn: false, error: 'Incorrect Username and/or Password!' });
                }			
            }
        );
	} else {
		res.json({ loggedIn: false, error: 'Please enter Username and Password!' });
	}
}

module.exports = {
    login: loginRoute
};