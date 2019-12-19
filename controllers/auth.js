const mysql = require('mysql');

const connection = mysql.createConnection({
	host     : process.env.REACT_APP_API_URL,
	user     : 'root',
	password : process.env.MYSQLPASSWORD,
	database : 'nodelogin'
});

function loginRoute(req, res) {

    
    const username = req.body.username,
        password = req.body.password;
    console.log(username, password);
    
	if (username && password) {
		connection.query(
            'SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], 
            function(error, results, fields) {

                if (error) {
                    console.log('error:', error, process.env.REACT_APP_API_URL);
                    res.json({ loggedIn: false, error });
                    return;
                }

                if (results.length > 0) {

                    req.session.loggedin = true;
                    req.session.username = username;
                    res.json({ loggedIn: true, error: false });

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