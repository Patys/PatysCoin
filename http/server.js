require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const router = require('./router');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(express.static(`${__dirname}/public/`));
router(app);

app.use((error, req, res, next) => {
  if (!error) {
    next();
  } else {
    res.send(500);
  }
});

app.listen(parseInt(process.env.HTTP_PORT, 10));
