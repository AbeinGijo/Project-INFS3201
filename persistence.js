const { MongoClient } = require('mongodb')
const mongodb = require('mongodb')
const crypto = require('crypto')


let client= undefined
let db = undefined 
let users=undefined
let session = undefined
let catloc = undefined

async function connectDatabase(){
    if (!client){
        client = await  new MongoClient("mongodb+srv://basharsoad:12class34@cluster0.d6lyly6.mongodb.net/")
        await client.connect()
        db = client.db("project")
        users=db.collection('UserAccounts')
        session = db.collection("sessionData")
        catloc = db.collection("catlocation")

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

module.exports = {
    startSession,
    findEmail,
    updatePassword,
    getSession,
    deleteSession,
    getUserDetails,
    getCatSites,
    updateNewuser,
    registerAccount
}