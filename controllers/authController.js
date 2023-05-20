const jwt = require('jsonwebtoken')
const User = require('../models/User')
const bcrypt = require('bcrypt')

const login = async (req,res) =>{

	const {name,password} = req.body;

	if(!name || !password) {
		return res.status(400).json({message:'All fields are require'})
	}

	const user = await User.findOne({name}).exec();

	if(!user){
		return res.status(401).json({message:'User not found'})
	}

	const match = bcrypt.compare(password,user.password);

	if(!match){
		return res.status(401).json({message:'Wrong password'})
	}

	const accessToken = jwt.sign(
        {
            "UserInfo": {
                "name": user.name,
                "appSettings": user.appSettings,
                "bio":user.bio,
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
        { "name": user.name },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    // Create secure cookie with refresh token 
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server 
        secure: true, //https
        sameSite: 'None', //cross-site cookie 
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })


	res.json({ accessToken })
}


const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const user = await User.findOne({ name: decoded.name }).exec()

            if (!user) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "name": user.name,
		                "appSettings": user.appSettings,
		                "bio":user.bio,
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })
        }
    )
}


const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
}