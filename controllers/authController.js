const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Khi login thêm các refresh token vào arr 
let refreshTokens = []

const authController = {
    // REGISTER
    registerUser: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            //Create new user
            const newUser = await new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
            });

            //Save user to DB
            const user = await newUser.save();
            res.status(200).json(user);

        } catch (error) {
            res.status(500).json(error)
        }
    },

    //GENERATE ACCESS TOKEN
    generateAccessToken: (user) => {
        return jwt.sign(
            {
                // token payload id and isAdmin 
                id: user.id,
                isAdmin: user.isAdmin
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "7d" }
            //  thời gian mã token hết hạn 
        )
    },

    //GENERATE REFRESH TOKEN
    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                isAdmin: user.isAdmin
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "365d" }
        )
    },

    // LOGIN
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username })
            if (!user) {
                return res.status(404).json('WRONG USERNAME !!')
            }
            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
            )
            if (!validPassword) {
                return res.status(404).json('WRONG PASSWORD!!')
            }

            if (user && validPassword) {
                // CREATE JWT
                const accessToken = authController.generateAccessToken(user)

                // CREATE RERFESH TOKEN
                const refreshToken = authController.generateRefreshToken(user)

                //KHI LOGIN THÌ PUSH REFRESH TOKEN HIỆN TẠI
                refreshTokens.push(refreshToken)

                //LƯU REFESHTOKEN VÀO COOKIES
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    scure: false,
                    path: '/',
                    sameSite: "strict",
                })


                //không trả password ra
                const { password, ...others } = user._doc
                res.status(200).json({ ...others, accessToken })
            }

        } catch (error) {
            res.status(500).json(error)
        }
    },

    // REFRESH TOKEN
    requestRefreshToken: (req, res) => {
        //Take refresh token from user
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(401).json('you are not authenticated')
        }

        if (!(refreshTokens.includes(refreshToken))) {
            return res.status(403).json('Refresh token is not valid')
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (err) {
                return res.status(403).json(err)
            }

            refreshTokens = refreshTokens.filter((token) => token !== refreshToken)

            //CREATE NEW ACCESS TOKEN  ,REFRESH TOKEN
            const newAccessToken = authController.generateAccessToken(user)
            const newRefreshToken = authController.generateRefreshToken(user)

            // LƯU REFRESH TOKEN VÀO MẢNG
            refreshTokens.push(newRefreshToken)

            // LƯU refresh token LẠI Ở COOKIES
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                scure: false,
                path: '/',
                sameSite: "strict",
            })

            res.status(200).json({ accessToken: newAccessToken })

        })


    },

    userLogOut: async (req, res) => {
        res.clearCookie('refreshToken')
        refreshTokens = refreshTokens.filter(token => token != req.cookies.refreshToken)
        res.status(200).json('LOGGED OUT !!')

    }
}


// LƯU TRỮ TOKEN
// localStorage : dễ bị tấn công XSS
// COOKIES : bị tấn công bởi CSRF -> khắc phục SAMESITE
// REDUX STORE -> LƯU ACCESSTOKEN
// HTTPONLY -> LƯU REFRESHTOKEN

// tối ưu nhất
//BFF PATTERN (BACKEND FOR FRONTEND)
module.exports = authController