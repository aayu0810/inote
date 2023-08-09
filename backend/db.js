const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1:27017/inote"
const connectToMongo = () => {
   
mongoose.connect(mongoURI).then(()=> { 
 
   console.log("connected to Mongo Successfully");

}) .catch((err)=> {
    console.log(err);
    
})

}
module.exports = connectToMongo;