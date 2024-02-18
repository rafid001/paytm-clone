const express = require("express");
const zod = require("zod");
const { User, Account } = require("../db");
const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware");
const router = express.Router();

const zodSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

router.post("/signup", async(req,res) => {
    const { success } = zodSchema.safeParse(req.body);
    if(!success) {
        return res.status(411).json({
            message: "wrong inputs"
        })
    }
    const existingUser = await User.findOne({
        username: req.body.username
    })
    if(existingUser) {
        return res.status(411).json({
            message: "user already exists"
        })
    }
    const newuser = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    })
    const userId = newuser._id;

    await Account.create({
        userId,
        balance: 1 + Math.random()*10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "user created successfully",
        token: token
    })
})

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin", async(req,res) => {
    const { success } = signinBody.safeParse(req.body);
    if(!success) {
        return res.status(411).json({
            message:"wrong inputs"
        })
    }
    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })
    if(user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
        res.json({
            token: token
        })
        return;
    }
    res.status(411).json({
        message: "error while logging in"
    })
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/", authMiddleware, async(req,res) => {
    console.log("inside put");
    const { success } = updateBody.safeParse(req.body);
    if(!success) {
        res.status(411).json({
            message: "wrong inputs for updation"
        })
    }
    console.log("before update")
    console.log(req.userId);
    await User.updateOne({ _id: req.userId }, req.body);
    console.log("after update")
    res.json({
        message: "user updated succesfully"
    })
})

router.get("/bulk", async(req,res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex":filter
            }
        }, {
            lastName: {
                "$regex":filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})


module.exports = router;