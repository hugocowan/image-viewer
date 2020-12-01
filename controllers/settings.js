const db = require('../models/dbconnection');
const { decrypt } = require('../lib/crypto');


function getRoute(req, res) {

    const accountId = decrypt(req.body.hash);
    
    db.query(
        'SELECT * FROM account_settings WHERE account_settings.account_id = ?', [ accountId ],
        function(error, results) {
            
            if (error) {
                console.log('Error while getting user settings:', error);
                res.json({ loggedIn: false, error });
                return;
            }

            if (results.length > 0) {

                const { show_settings, context, sorting, columns, fix_navbar, side_margin } = results[0], 
                    fixNavbar = (fix_navbar === 1) ? true : false,
                    showSettings = (show_settings === 1) ? true : false;

                res.json({ showSettings, context, sorting, columnNumber: columns, fixNavbar, sideMargin: side_margin });
            } else {

                res.json({ error: 'No user settings' });
            }
        }
    );
}

function setRoute(req, res) {

    let { showSettings, context, sorting, columns, fixNavbar, hash, sideMargin } = req.body, accountId = decrypt(hash);
    showSettings = (showSettings === true) ? 1 : 0;
    fixNavbar = (fixNavbar === true) ? 1 : 0;
    
    db.query(
        'UPDATE account_settings SET show_settings = ?, context = ?, sorting = ?, `columns` = ?, fix_navbar = ?, side_margin = ? WHERE account_settings.account_id = ?;', [ showSettings, context, sorting, columns, fixNavbar, sideMargin, accountId ],
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