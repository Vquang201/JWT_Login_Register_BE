const jwt = require('jsonwebtoken')


const middlewareController = {

    // VERIFY TOKEN
    verifyToken: (req, res, next) => {
        // lấy token từ người dùng
        const token = req.headers.token
        if (token) {
            // Bearer 123456 
            const accessToken = token.split(" ")[1]
            // result: 123456
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                console.log('user', user)

                if (err) {
                    return res.status(403).json('TOKEN IS NOT VALID')
                }
                req.user = user
                next()
            })
        } else {
            return res.status(401).json("You're not authenticated")
        }
    },

    //VERYFY TOKEN AN ADMIN AUTH
    verifyTokenAnAdminAuth: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.id == req.params.id || req.user.isAdmin) {
                next()
            } else {
                return res.status(403).json('You are not allowed to delete other')
            }
        })


    }
}
module.exports = middlewareController