
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    //console.log("in req login")
    //console.log(req.headers)
    const { authorization } = req.headers;
    if (!authorization) {
        return res.send({ errors: [{ message: "Please login/signup to access this page"}]})
    }
    const token = authorization.replace("Bearer ", "")
    
    //console.log(token)
    
    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
          return res.send({ errors: [{ message: "Please login/signup to access this page"}]})
        }
        //console.log("PAYLOAD", payload)
        const currentUser = {
            ...payload._doc
            
        }
        //console.log("CURRENTSUER", currentUser)
        req.currentUser = currentUser
        next()
       

    })
    
}