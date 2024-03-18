const mongoose = require('mongoose');

//MongoDB Atlas EV-Trainer-Cluster
const uri = "mongodb+srv://jeffreyli:IGLLIgJXJsMQMAjI@ev-trainer-cluster.xjqhd0m.mongodb.net/?retryWrites=true&w=majority&appName=EV-Trainer-Cluster";

mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
})
    .then(() => console.log("Established a connection to the database"))
    .catch(err => console.log("Something went wrong when connecting to the database", err));

