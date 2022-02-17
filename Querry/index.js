const express = require('express')
const app = express()
const Query = require('./models/Post')
const requireAuth = require('./middleware/require-auth')
const mongoose = require('mongoose')
require('dotenv').config()
const cors = require('cors')
app.use(express.json())
app.use(cors())

//eg:
// mergedPost = {
//     'postId': {
//         postId: 'postid',
//         title: 'postconetn',
//         commnets : [{co_id,content}]
//     }
// } 
app.get('/api/querry/mergedPost', async(req, res) => {
    //res.send({posts})
    //const posts = Post.find({})
    try {
        const posts = await Query.find();
        console.log(posts)
        res.send({posts})
    }
    catch (e) {
        return res.send({ errors: [{ message: "Unable to fetch posts.plz try again.."}]})
    }

})


app.get('/api/querry/mergeduserPost', requireAuth, (req, res) => {
    //console.log(req.currentUser)
    Query.find({postedByName:req.currentUser.userId})
        .then((posts) => {
        console.log(posts)
        res.send({posts})
    })
    .catch(e => {
        return res.send({ errors: [{ message: "Unable to fetch posts.plz try again.."}]})
        console.log(e)
        
    })
  
})

app.post('/api/querry/events', async(req, res) => {
    const { type, data } = req.body
    console.log('Recieved EVENT',req.body.type,'--TAKING ACTIONS')
    if (type == 'PostCreated') {
            const post = new Query({
                _id: data._id,
                title: data.title,
                description: data.description,
                postedByName:data.postedByName
        })
        await post.save()
        res.send({})
    }
    else if (type == 'CommentCreated') {
        console.log(data)
        Query.findByIdAndUpdate(data.postId, {
            $push: {
                comments: {
                    _id: data._id,
                    commentedByName: data.commentedByName,
                    comment:data.comment
                }
            }
        }, {
            new:true
        })
        .exec((err, result) => {
            if (err) {
                return res.json({error:err})
            }
            else {
                console.log(result)
                return res.json(result)
            }
        })

    }
    else if (type == 'PostDeleted') {
        Query.findOne({ _id: data._id })
            .exec((err, post) => {
                if (err || !post)
                    return res.json({ error: err })
                //console.log("ERR",err,"POST",post)
                post.remove()
                    .then(async result => res.send({}))
                    .catch(error => res.send({}))
                })
            }
    //console.log(mergedPost)
    
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
    console.log(`Query service Listening on port ${process.env.PORT}`)
    })
    

}
start()