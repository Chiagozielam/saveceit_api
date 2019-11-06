import jwt from 'jsonwebtoken';

const verifyLogin = (req, res, next) => {
    const token = req.header('user-token')
    if(!token) return res.status(401).send('Access Denied')

    try{
        const verified = jwt.verify(token, process.env.USER_TOKEN_SECRET)
        req.user = verified;
        next();
    }catch(err){
        console.log(token)
        res.status(400).send('Invalid Token')
    }
}

export {
    verifyLogin
}