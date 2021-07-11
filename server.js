// require http modules first
const http = require('http');

//import app.js file
const app = require('./app');

app.get('/', (req, res, next) => {
  res.status(200).send('You have called the root directory');
});

//define port to be used
const port = process.env.PORT || 3100;
const server = http.createServer(app);


server.listen(port, () => {
    //    let's print a message when the server run successfully
    console.log("Server restarted successfully")
});