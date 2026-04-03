var mongoose=require("mongoose")

let colDesign={
    name:{type:String,required:true},
    email:{type:String,required:true,index:true,unique:true},
    password:String,
    contactNo:String,
    userType:{type:String,enum:["customer","tailor"],default:"customer"},
    dos:{type:Date,default:Date.now},
    agreeToTerms:{type:Boolean},
    // Extended Profile Fields
    shopName: String,
    bio: String,
    specialties: [String], // Array of strings
    experience: String,
    address: String,
    website: String,
    profileImage: String,
    isProfileComplete: { type: Boolean, default: false },

    // New Fields (Feb 2026 Update)
    aadharNo: String,
    category: String,
    since: String,
    workType: String,
    shopAddress: String,
    shopCity: String,
    socialWebsite: String,
    socialInsta: String,
    socialFb: String,
    otherInfo: String,
    
    // Detailed Personal
    gender: String,
    languages: [String],
    education: String,

    // Detailed Professional
    serviceArea: String,
    pricingStart: String,

    // Detailed Business
    operatingHours: String,
    paymentMethods: [String],
    homeDelivery: { type: Boolean, default: false },

    // Dynamic Measurements for Customers
    measurements: {
        chest: { type: String, default: "" },
        waist: { type: String, default: "" },
        shoulderWidth: { type: String, default: "" },
        sleeveLength: { type: String, default: "" },
        neck: { type: String, default: "" },
        inseam: { type: String, default: "" },
        hip: { type: String, default: "" },
        lastUpdated: { type: Date, default: Date.now }
    }
}

var ver=
{
    versionKey:false, 
};

let SchemaClass=mongoose.Schema; 
let collectionobj=new SchemaClass(colDesign,ver); 
let userColRef=mongoose.model("SignedUser",collectionobj)


module.exports=userColRef   