const mongoose = require('mongoose')

//old uri
//const DATABASE_URI = 'mongodb+srv://blink-db-social:HvOjYzJ5nSb8HyJ4@cluster0.douur2b.mongodb.net/blink-db?retryWrites=true&w=majority';

//new cluster uri2024
const DATABASE_URI = 'mongodb+srv://blink2024:NXFy38CeXrZecIIV@cluster0.z5rikpp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectDB = async () => {

    try {
        await mongoose.connect(DATABASE_URI,options)
    } catch (err) {	
        console.log(err)
    }
}

module.exports = connectDB