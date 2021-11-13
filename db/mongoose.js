const mongoose = require('mongoose');
const chalk = require('chalk');
const dotenv = require('dotenv');

dotenv.config()


mongoose.connect(process.env.mongo_url,{
    useNewUrlParser : true
}).then(()=>{
    console.log(chalk.bold.green.inverse('Connected to database'));
}).catch(console.error);


