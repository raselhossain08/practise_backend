
const express = require('express');
const app = express();
const ErrorMiddleware = require('./middleware/error')
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const fetchAndSaveData  = require('./fetch/fetchAndSaveData')
// setting up config file
dotenv.config({path: './config/config.env'})
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT ;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// database  connectDatabase
const connectDatabase = require('./db/db');
connectDatabase()
app.get('/', (req, res) =>{
    res.send('Welcome to longx')
})



app.use(express.json());
app.use(bodyParser.json())
app.use(cookieParser());
app.use(cors())

app.use(ErrorMiddleware)
//  all Routes 
const auth = require('./routes/auth')
const wallet = require('./routes/wallet')

const userVerification = require('./routes/verification')
const doc = require('./routes/doc')
const person = require('./routes/PersonVerification')
app.use('',auth)
app.use('',wallet)
app.use('',userVerification)
app.use('',doc)
app.use('',person)


const uploadRoute = require('./routes/companyVerification');


app.use(uploadRoute);
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
