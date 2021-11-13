//=============================================== Declare Variables =============================//
const express = require('express');
const app = express();
require('./db/mongoose');
const chalk = require('chalk');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
const cors = require('cors')
const paypal = require('paypal-rest-sdk');

dotenv.config()
const port = process.env.port || 8080;

// About paypal
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.CLIENT_ID,
  'client_secret': process.env.SECRET_KEY
});


app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));



//============================================== import routes =================================//
const authRouter = require('./routes/auth')
const userRoute = require('./routes/user')
const bookRoute = require('./routes/book')
const categoryRouter = require('./routes/category')
const commentRouter = require('./routes/comment')
const stripeRouter = require('./routes/stripe')
const paypalRouter = require('./routes/paypal')



//********Middle wares********//
app.use(cors())
app.use(express.json())
app.use(bodyParser())
app.use('/api/auth', authRouter)
app.use('/api/users', userRoute)
app.use('/api/books', bookRoute)
app.use('/api/categories', categoryRouter)
app.use('/api/comments', commentRouter)
app.use('/api/payment', stripeRouter)
app.use(paypalRouter)



//=============================================== Connect To Server ===========================//
app.listen(port, ()=>console.log(chalk.bold.green.inverse('Server is up on Port', port)));
