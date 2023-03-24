const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')

const app = express()
dotenv.config()

//CONNECT DB
// mongoose.connect((process.env.MONGODB_URL), () => {
//     console.log('CONNECT DB ...')
// })
async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Connected to MongoDB!')
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
}
connectToMongoDB()

app.use(cors())
app.use(cookieParser())
app.use(express.json())

//ROUTES
app.use('/v1/auth', authRoute)
app.use('/v1/user', userRoute)

app.listen('8080', () => {
    console.log('sever is running ... ')
})

// AUTHENTICATION : so sánh dữ liệu mình nhập với db
// AUTHORIZATION : thực hiện chức năng phân quyền (role là user hay role admin)