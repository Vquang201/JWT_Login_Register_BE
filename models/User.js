const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            require: true,
            min: 6,
            max: 20,
            unique: true,
            // unique true là không cho trùng username 
        },
        email: {
            type: String,
            require: true,
            max: 50,
            unique: true,
        },
        password: {
            type: String,
            require: true,
            min: 6,
        },
        isAdmin: {
            type: Boolean,
            default: false,
            // mặc định tạo tài khoản là không phải adm
        },
    },
    { timestamps: true }
);
// timestamps nó cho mình biết user này đươc tạo khi nào

module.exports = mongoose.model("User", userSchema);