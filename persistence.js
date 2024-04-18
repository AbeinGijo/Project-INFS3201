const { MongoClient } = require('mongodb')
const mongodb = require('mongodb')
const crypto = require('crypto')


const fs = require('fs').promises;

let client= undefined
let db = undefined 
let users=undefined
let session = undefined
let catloc = undefined
let posts = undefined
let urgloc=undefined

async function connectDatabase(){
    if (!client){
        client = await  new MongoClient("mongodb+srv://basharsoad:12class34@cluster0.d6lyly6.mongodb.net/")
        await client.connect()
        db = client.db("project")
        users=db.collection('UserAccounts')
        session = db.collection("sessionData")
        catloc = db.collection("catlocation")
        urgloc=db.collection("urgent")
        posts= db.collection("posts")
        return db
    }
}

// sd = sessiondata, here we start the session.
async function startSession(sd){
    await connectDatabase()
    let db = client.db("project")
    let session = db.collection('sessionData')
    await session.insertOne(sd)
}



// finding the session based on the session key.
// The 'getSession' function retrieves a session based on the session key

async function getSession(key){
    await connectDatabase()

    let sd  = await session.find({key:key})

    let resultData = await sd.toArray()
    return resultData[0]

}

//function for deleting the session.
// The 'deleteSession' function deletes a session from the 'sessionData' collection based on the session key.

async function deleteSession(key){
    await connectDatabase()
    db = client.db('project')
    session = db.collection("sessionData")
    await session.deleteOne({sessionNumber:key})
}



async function updateSession(sd){
    await connectDatabase()
    // Replace the existing session document in the database with the new session document
    await session.replaceOne({ key: sd.key}, sd)
}

async function validateSession(sessionKey) {
    await connectDatabase();
    let result = await session.findOne({ key: sessionKey });
    return result;
  }

async function getUserDetails(username) {
    await connectDatabase()
    let result = await users.find({ username: username })
    let resultData = await result.toArray()
    return resultData[0]
}

async function getCatSites(){
    await connectDatabase()
    let result = await catloc.find()
    let resultData = await result.toArray()
    return resultData
}

async function getMyPosts(sd){
    await connectDatabase()

    let result = await posts.find({username: sd.data.username})
    let resultData = await result.toArray()
    return resultData
}

async function getUrgentSites(){
    await connectDatabase()
    let result = await  urgloc.find()
    let resultData = await result.toArray()
    return resultData
}

// Function to update the last login date for a user
async function updateNewuser(username, date) {
    // Connect to the database
    await connectDatabase();
    // Update the user's last login date in the database
    await users.updateOne({ username: username }, { $set: { last_login: date } });
}

// Function to register a new user
async function registerAccount(user) { //adds the whole object containing user data
    // Connect to the database
    await connectDatabase();
    // Check if the username or email already exists in the database
    let verifyName = await users.findOne({ username: user.username });
    let verifyEmail = await users.findOne({ email: user.email });

    // If the username or email already exists, return undefined
    if (verifyName || verifyEmail) {
        return undefined;
    }
    // If the username and email do not exist, add the user to the database
    else {
        return await users.insertOne(user); //if not registered then add user data to database
    }
}

//password reset
async function findEmail(email){
    await connectDatabase()
    let result = await users.findOne({email:email})
    return result
}

async function updatePassword(email,password){
    await connectDatabase()
    await users.updateOne({email:email},{$set:{password:password}})
}

async function uploadReport(data,file){
    await connectDatabase()
    await updateFeedingSites(data.location,data.noCats,data.lastVisitDate,data.foodLevel,data.waterLevel)
    if(file){
        let binaryData = await fs.readFile(file.path)
        data.image=binaryData
    }

    let result = await posts.insertOne(data);
    if(data.issues !=="" && data.category !== ""){
        let urgent = await insertUrgent(data.location,data.category,data.issues)
    }
    let files = await fs.readdir(`${__dirname}/uploads`)
    for(f of files){
        await fs.unlink(`${__dirname}/uploads/${f}`)
    }
    return result
}

async function updateFeedingSites(loc, cat,date, food,water){
    await connectDatabase()
    let data = await catloc.findOne({location:loc})

    data.noCats=cat
    data.lastVisitDate=date
    data.foodLevel+=food
    data.waterLevel+=water
    if(cat<=0){
        data.status="Inactive"
    }
    else{
        data.status="Active"
    }

    await catloc.replaceOne({location:loc},data)
}

async function insertUrgent(loc,cat,issue){
    await connectDatabase()
    await urgloc.insertOne({
        location:loc,
        category: cat,
        description: issue
    })
    return
}

async function getCatlocations(){
    await connectDatabase()
    let result = await catloc.find()
    let resultData = await result.toArray()
    let locs= []
    for(let loc of resultData){
        locs.push(loc.location)
    }
    return locs
}

async function getAllPosts(){
    await connectDatabase()
    let result = await posts.find()
    let resultData = await result.toArray()
    let z=[]
    for (c of resultData){
        z.push({noCats:Number(c.noCats),location:c.location,status:c.status,image:c.image})
    }
    return z

}

module.exports = {
    startSession,
    findEmail,
    updatePassword,
    getSession,
    deleteSession,
    getUserDetails,
    registerAccount,
    updateSession,
    updateNewuser,
    getCatSites,
    getUrgentSites,uploadReport,
    registerAccount,
    getMyPosts,
    validateSession,
    getCatlocations,
    getAllPosts
}