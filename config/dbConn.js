const mongoose = require('mongoose')
const DATABASE_URI = 'mongodb+srv://blink-db-social:HvOjYzJ5nSb8HyJ4@cluster0.douur2b.mongodb.net/blink-db?retryWrites=true&w=majority';

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