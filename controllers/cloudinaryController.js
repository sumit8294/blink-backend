const cloudinary = require("cloudinary").v2
const cloudinaryConfig = require('../config/cloudinaryConfig');

const getSignature = (req, res) => {

	const timestamp = Math.round(new Date().getTime() / 1000)

	const signature = cloudinary.utils.api_sign_request(
	{
		timestamp: timestamp
	},

	cloudinaryConfig.api_secret
	)

	res.status(200).json({ timestamp, signature })
}

const getCloudDetails = (req, res) => {

	const {cloud_name, api_key} = cloudinaryConfig;
	res.status(200).json({ cloud_name, api_key })
}

module.exports = {getSignature,getCloudDetails};