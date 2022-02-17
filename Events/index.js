const express = require('express')
const axios = require('axios')
const cors = require('cors')

require('dotenv').config()
const app = express()
app.use(express.json())
app.use(cors())

app.post('/events', (req, res) => {
    const event = req.body;
    console.log("EVENT RECIEVED ON THE BUS :",req.body.type)
    axios.post('http://connect-posts-srv:4002/api/posts/events',event)
    axios.post('http://connect-comments-srv:4003/api/comments/events',event)
    axios.post('http://connect-querry-srv:4004/api/querry/events',event)
    // axios.post(`http://${process.env.URL}:4002/api/posts/events`,event)
    // axios.post(`http://${process.env.URL}:4003/api/comments/events`,event)
    // axios.post(`http://${process.env.URL}:4004/api/querry/events`,event)
    
    res.send({status:'OK'})
})


const start = async () => {
    app.listen(process.env.PORT, () => {
    console.log(`Event bus Listening on port ${process.env.PORT}`)
    })
    
}
start()