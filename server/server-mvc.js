require("dotenv").config();
var express=require("express");
var fileuploader=require("express-fileupload");
const cors=require("cors");

var authRouter=require("./routes/authRouter");
const { doConnectWithMongodbAtlas } = require("./config/db");


var app=express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(fileuploader());
app.use(cors());

doConnectWithMongodbAtlas().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server Started on Port: ${PORT}`);
        // Server started successfully
    });
}).catch(err => {
    console.error("Failed to connect to MongoDB", err);
});

app.use("/api", authRouter);
app.use("/user", authRouter); // Keep for compatibility

app.use((req, res) => {
  console.log(req.method, req.url);
  res.status(404).send("Invalid URL");
});