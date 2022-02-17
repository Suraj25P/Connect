const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const requireAuth = require('./middleware/require-auth')
const Account = require('./models/Account');
require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors');
const app = express()

app.use(express.json())
app.use(cors())
//app.use(currentUser)



app.get('/api/auth/currentuser',requireAuth,(req, res) => {
      res.send({ currentUser: req.currentUser || null })
})

app.post('/api/auth/login', [
    body('userId')
        .trim()
        .notEmpty()
        .withMessage('used Id is required'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('password is required')
    ],
    async (req, res) => {
        //validationResult has results of validation
        const valErr = validationResult(req)
        if (!valErr.isEmpty()) {
            errors = valErr.array()
            errorList = errors.map(err => {
                     return {message : err.msg , field:err.param}
            })
        console.log(errorList)
        return res.send({errors:errorList})
        }
        
        const { userId, password } = req.body;

        //check if userID exists
        const existingUser = await Account.findOne({ userId })
        if (!existingUser) {
            return res.send({ errors: [{ message: "This Accound Doesnt exist..Please Create one if you havent already.."}]})
        }
        //check if passwords match ...compare 
        const passwordsMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordsMatch)
            return res.send({ errors: [{ message: "Invalid Credentials"}]})

        existingUser.password = undefined;
        const userJwt = jwt.sign({
            ...existingUser
        }, process.env.JWT_KEY)

        return res.send({user:existingUser,token:userJwt})
    }
)

app.get('/api/auth/signout', (req, res) => {
    req.session = null
    res.send({})
})

//signup a user
//takes email , password, role
app.post('/api/auth/signup', [
    body('userId')
        .trim()
        .notEmpty()
        .withMessage('User Id is required'),
    body('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Please enter a valid Password(4-20 charecters)'),
    body('description')
        .trim()
        .isLength({ min: 1, max:100 })
        .withMessage('Enter a short desciption(<200 charecters)')
], async (req, res) => {
    //validationResult has results of validation
    const valErr = validationResult(req)
    if (!valErr.isEmpty()) {
            errors = valErr.array()
            errorList = errors.map(err => {
                     return {message : err.msg , field:err.param}
            })
        
        return res.send({errors:errorList})
        }
    const { userId, password ,description} = req.body
    //Check if the user already exists
    const existing = await Account.findOne({ userId })
    if (existing) {
        return res.send({ errors: [{ message: "This user ID is already in taken...plz choose another one"}]})
    }
    
    //create a new user and store in database
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
        const account = new Account({
            userId,
            password: hashedPassword,
            description
        })
        await account.save()
        // generate json token

        account.password = undefined;
        const accountJwt = jwt.sign({
            ...account
        }, process.env.JWT_KEY)

        return res.send({user:account,token:accountJwt})   
 
    }
    catch (e) {
        console.log(e)
        return res.send({ errors: [{ message: "Unable to create this account.plz try again.."}]})
    }   
})



// starting app
const start = async () => {
    try {
    console.log('connecting to DB')
      await mongoose.connect(process.env.MONGO_URI)
      console.log('connected to DB')
    }
    catch (err) {
      console.error(err)
    }
    app.listen(process.env.PORT, () => {
    console.log(`Auth service Listening on port ${process.env.PORT}`)
    })
    

}
start()