const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
const Comments = require('./models/Comments')
const requireAuth = require('./middleware/require-auth')
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose')
require('dotenv').config()
app.use(express.json())
app.use(cors())

// {
// post id1 = [{ comment_id, comment }, { comment_id, comment }]
// post id2 = [{comment_id , comment},{comment_id , comment}]
// }
const commentsByPostId = {};


app.get('/api/comments/:id/comments', async (req, res) => {
    //res.send(commentsByPostId[req.params.id] || [])
    console.log(req.params.id)
    try {
        const commentsOnaPost = await Comments.find({ userId: req.params.id })
        console.log(commentsOnaPost)
        res.send({commentsOnaPost})
    }
    catch (e) {
        console.log(e)
        return res.send({ errors: [{ message: "Unable to fetch comments.plz try again.."}]})
    }
})


app.post('/api/comments/postcomment',requireAuth,[
    body('content')
        .not()
        .isEmpty()
        .withMessage('comment is required'),
],async(req, res) => {
        const valErr = validationResult(req)
        if (!valErr.isEmpty()) {
            errors = valErr.array()
            errorList = errors.map(err => {
                     return {message : err.msg , field:err.param}
            })
        console.log(errorList)
        return res.send({errors:errorList})
        }

    const { content ,postId } = req.body;
    
        try {
        const comment = new Comments({
            commentedByName : req.currentUser.userId,
            postId,
            comment : content
            
        })
        await comment.save()

    //emetting event
    evt = {
        type: 'CommentCreated',
        data: {
            _id:comment._id,
            postId :comment.postId,
            commentedByName :comment.commentedByName,
            comment : comment.comment
        }
            }
            console.log(evt)
            //http://${process.env.URL}:4006/events
    await axios.post('http://connect-events-srv:4006/events',evt)
    res.send(comment)
    }
    catch (e) {
        console.log(e)
        return res.send({ errors: [{ message: "Unable to create this comment.plz try again.."}]})
    } 
    //event emitter
    // await axios.post('http://localhost:4005/events',evt)
    // res.send(comment)
})

//event handler -- recieves event from event bus
app.post('/api/comments/events',  (req, res) => {
    console.log('Recieved EVENT',req.body.type,'--NO ACTIONS')
})


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
    console.log(`Comment service Listening on port ${process.env.PORT}`)
    })
    

}
start()