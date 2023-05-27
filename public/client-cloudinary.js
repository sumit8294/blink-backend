const api_key = "your-api-key-here"
const cloud_name = "your-cloud-name-here"


document.querySelector("#upload-form").addEventListener("submit", async function (e) {
  e.preventDefault()

  // get signature. In reality you could store this in localstorage or some other cache mechanism, it's good for 1 hour
  const signatureResponse = await axios.get("/cloudinary/get-signature")

  const data = new FormData()
  data.append("file", document.querySelector("#file-field").files[0])
  data.append("api_key", api_key)
  data.append("signature", signatureResponse.data.signature)
  data.append("timestamp", signatureResponse.data.timestamp)

  const cloudinaryResponse = await axios.post(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, data, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: function (e) {
      console.log(e.loaded / e.total)
    }
  })
  console.log(cloudinaryResponse.data)

  // send the image info back to our server
  const photoData = {
    public_id: cloudinaryResponse.data.public_id,
    version: cloudinaryResponse.data.version,
    signature: cloudinaryResponse.data.signature
  }

  axios.post("/do-something-with-photo", photoData)
})

//use this to display images and store the public id in the database 
<>
<img src={`https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/w_200,h_100,c_fill,q_100/${public_id}.jpg`}/>
</>