const jwt = require('jsonwebtoken');
const {User} = require('../models/user')
require('dotenv')
const authentification = async(req, res, next) => {
     try { 
        const header = req.header('Authorization').replace("Bearer ", "");
        const decodeToken = jwt.verify(header, );
        const user = await User.findOne( {_id: decodeToken._id, 'authTokens.authToken': header});

        if(!user) throw new Error();
        req.user = user;
        req.auth = header;
        

        next();
     } catch (error) {
        res.status(401).send({
            data: {
                message: "Merci de vous authentifier !"
            }
        })
     }
}

module.exports = {
    authentification
}