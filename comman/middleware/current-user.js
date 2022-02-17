//extracts data from jwt and sets it on req.currentuser
const jwt = require('jsonwebtoken')
const currentUser = (req, res, next) => {
    console.log("REQ OBJECT current user " , req.session)
    if (!req.session || !req.session.jwt) {
        console.log('ssssskdflks')
       return next()
    }
    try {
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY)
        console.log("PAYLOAD:",payload)
        req.currentUser = payload
        console.log(req.currentUser)
        next()
    }
    catch (e) {
        console.log(e)
        next()
    }  

}


module.exports = currentUser