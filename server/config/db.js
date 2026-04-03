var mongoose=require("mongoose");

async function doConnectWithMongodbAtlas()
{
    //let url="mongodb://localhost:27017/2026jan";
    let url=process.env.MONGO_URI;
    await mongoose.connect(url)
    .then(()=>console.log("Connect to Mongodb Atlas (TailorConnect)"))
    .catch((err)=>console.log("Atlas Connection Error: " + err.message))
}

module.exports={doConnectWithMongodbAtlas}