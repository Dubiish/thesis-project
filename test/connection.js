const mongoose = require("mongoose");

before((done) => {
    mongoose.connect("mongodb://localhost/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    
    mongoose.connection.once("open", () => {
        console.log("Connection has been made");
        done()
    }).on("error", (error) => {
        console.log("Connection error", error)
    })
})
