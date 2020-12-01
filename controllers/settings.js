const db = require('../models/dbconnection');


function getRoute(req, res) {

    const accountName = req.body.username;

    db.query(
        'SELECT * FROM account_settings INNER JOIN accounts ON account_settings.account_id = accounts.id WHERE accounts.username = ?', [ accountName ],
        function(error, results, fields) {
            
            if (error) {
                console.log('Error while getting user settings:', error);
                res.json({ loggedIn: false, error });
                return;
            }

            if (results.length > 0) {
                res.json({ showNav: (results[0].show_settings === 1) ? true : false, navContext: results[0].context, sortType: results[0].sorting, columnNumber: results[0].columns, fixNavbar: (results[0].fix_navbar === 1) ? true : false });
            } else {

                res.json({ error: 'No user settings' });
            }
        }
    );
}

function setRoute(req, res) {

    const { showSettings, context, sorting, columns, fixNavbar, accountName } = req.body;

    console.log(showSettings, context, sorting, columns, fixNavbar, accountName);


    db.query(
        'UPDATE account_settings INNER JOIN accounts ON account_settings.account_id = accounts.id SET show_settings = ?, context = ?, sorting = ?, `columns` = ?, fix_navbar = ? WHERE accounts.username = ?;', [ (showSettings === true) ? 1 : 0, context, sorting, columns, (fixNavbar === true) ? 1 : 0, accountName ],
        function(error, results, fields) {
            if (error) {
                console.log('Error while adding/updating user settings:', error);
                res.json({ loggedIn: false, error });
                return;
            }

            res.json({ success: true });
        }
    );
}

module.exports = {
    get: getRoute,
    set: setRoute
};