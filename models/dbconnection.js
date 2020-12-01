const mysql = require('mysql');

const connection = mysql.createConnection({
	host     : process.env.API_URL,
	user     : process.env.USER,
    password : process.env.MYSQLPASSWORD,
    port     : process.env.MYSQLPORT || 3306,
	database : 'image_viewer'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Server!');
});

module.exports = connection;