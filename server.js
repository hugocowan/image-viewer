const router = require('./config/router.js');
const port = process.env.PORT || 5001;
const express = require('express');
const app = express();

app.use('/assets', express.static(`${__dirname}/src/assets`));
app.use(express.json());
app.use('/api', router);
app.get('/*', (req, res) => res.sendFile(`${__dirname}/public/index.html`));

app.listen(port, () => console.log(`Listening on port ${port}`));