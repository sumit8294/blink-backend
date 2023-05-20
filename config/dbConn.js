const mongoose = require('mongoose')
const DATABASE_URI = 'mongodb+srv://blink-db-social:HvOjYzJ5nSb8HyJ4@cluster0.douur2b.mongodb.net/?retryWrites=true&w=majority';

const connectDB = async () => {

    try {
        await mongoose.connect(DATABASE_URI)
    } catch (err) {	
        console.log(err)
    }
}

module.exports = connectDB