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
    const PORT = 3005;
    app.listen(PORT, () => {
        console.log(`Server Started on Port: ${PORT}`);
        // Log registered routes for debugging
        app._router.stack.forEach((r) => {
            if (r.route && r.route.path) {
                console.log(`Route: ${r.route.path}`);
            } else if (r.name === 'router') {
                r.handle.stack.forEach((handler) => {
                    if (handler.route) {
                        console.log(`Sub-Route: ${handler.route.path} (${Object.keys(handler.route.methods)})`);
                    }
                });
            }
        });
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
