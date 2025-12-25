const mongoose = require('mongoose');
require('dotenv').config();

//MongoDB Atlas EV-Trainer-Cluster

//URI currently unused, using localhost
const uri = process.env.ATLAS_URI || "";
const localhost = 'mongodb://127.0.0.1:27017';

mongoose.connect(localhost, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
})
    .then(() => console.log("Established a connection to the database"))
    .catch(err => console.log("Something went wrong when connecting to the database", err));

