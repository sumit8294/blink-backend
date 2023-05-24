const cloudinary = require('cloudinary').v2;

// Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// Upload
const uploadImage = (imageName) =>{

	const res = cloudinary.uploader.upload(`./public/images/${imageName}`, {public_id: imageName})

	res.then((data) => {
	  console.log(data);
	  console.log(data.secure_url);
	  return data.secure_url;
	}).catch((err) => {
	  console.log(err);
	});

}

module.exports = {uploadImage};