const express = require('express')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')
const requireAuth = require('./middleware/require-auth')
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose')
const Post = require('./models/Post')
require('dotenv').config()
const app = express()
//app.set('trust proxy', true) 
// app.use(cookieSession({
//     secret: "dsafsfdasfsafs",
//     resave: false,
//     saveUninitialized:false
// }))
app.use(express.json())
app.use(cors())

//app.use(currentUser)


//const posts = {};


app.get('/api/posts/posts', async(req, res) => {
    //res.send({posts})
    //const posts = Post.find({})
    try {
    const posts = await Post.find();
    res.send({allposts:posts})
    }
    catch (e) {
        return res.send({ errors: [{ message: "Unable to fetch posts.plz try again.."}]})
    }

})


app.get('/api/posts/userposts', requireAuth, (req, res) => {
    //console.log(req.currentUser)
    Post.find({postedBy:req.currentUser._id})
    .then((myposts)=> {
        res.send({myposts})
    })
    .catch(e => {
        return res.send({ errors: [{ message: "Unable to fetch posts.plz try again.."}]})
        console.log(e)
        
    })
  
})

app.post('/api/posts/addpost',requireAuth,[
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('description')
        .not()
        .isEmpty()
        .withMessage('body is required')
], async (req, res) => {
    //console.log("KSOLDFKDS:KF")
        const valErr = validationResult(req)
        if (!valErr.isEmpty()) {
            errors = valErr.array()
            errorList = errors.map(err => {
                     return {message : err.msg , field:err.param}
            })
        //console.log(errorList)
        return res.send({errors:errorList})
        }
    const { title, description } = req.body;
    try {
        const post = new Post({
            title,
            description,
            postedByName : req.currentUser.userId,
        })
        await post.save()

        //emetting event
        evt = {
        type: 'PostCreated',
        data: {
            _id : post._id,
            title:post.title,
            description :post.description,
            postedByName : post.postedByName 
        }
        }
        try {
           
            //'http://localhost:4006/events
        await axios.post('http://connect-events-srv:4006/events',evt)
        }
    catch(e)
    {
        return res.send({ errors: [{ message: "Unable to create this post.plz try again.."}]})
    }
    return res.send(post)
    }
    catch (e) {
        console.log(e)
        return res.send({ errors: [{ message: "Unable to create this post.plz try again.."}]})
    } 

})


app.delete("/api/posts/deletepost/:postId", requireAuth, async(req, res) => {
    //emetting event here
    evt = {
        type: 'PostDeleted',
        data: {
            _id :req.params.postId,
        }
    }
    try {
        //http://localhost:4006/events
         await axios.post('http://connect-events-srv:4006/events',evt)
        }
    catch(e)
        {
            return res.send({ errors: [{ message: "Unable to create this post.plz try again.."}]})
        }


    Post.findOne({ _id: req.params.postId })
        .exec((err, post) => {
            if (err || !post) {
                res.json({error:err})
            }
            //console.log("ERR",err,"POST",post)
                post.remove()
                .then(async result => {
                    res.json({ result })
                                        })
                .catch(error => {
                    {
                            res.json({error:error})
                    }
                })
            
        })
})


//event handler -- recieves event from event bus
app.post('/api/posts/events',  (req, res) => {
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
    console.log(`Post service Listening on port ${process.env.PORT}`)
    })
    

}
start()