const db = require('../models/dbconnection');


function getRoute(req, res) {

    const username = req.body.username;

    db.query(
        'SELECT * FROM account_settings INNER JOIN accounts ON account_settings.account_id = accounts.id WHERE accounts.username = ?', [ username ],
        function(error, results) {
            
            if (error) {
                console.log('Error while getting user settings:', error);
                res.json({ loggedIn: false, error });
                return;
            }

            if (results.length > 0) {

                const { show_settings, context, sorting, columns, fix_navbar, side_margin } = results[0];

                res.json({ showSettings: (show_settings === 1) ? true : false, context, sorting, columnNumber: columns, fixNavbar: (fix_navbar === 1) ? true : false, sideMargin: side_margin });
            } else {

                res.json({ error: 'No user settings' });
            }
        }
    );
}

function setRoute(req, res) {

    const { showSettings, context, sorting, columns, fixNavbar, username, sideMargin } = req.body;

    db.query(
        'UPDATE account_settings INNER JOIN accounts ON account_settings.account_id = accounts.id SET show_settings = ?, context = ?, sorting = ?, `columns` = ?, fix_navbar = ?, side_margin = ? WHERE accounts.username = ?;', [ (showSettings === true) ? 1 : 0, context, sorting, columns, (fixNavbar === true) ? 1 : 0, sideMargin, username ],
        function(error) {
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