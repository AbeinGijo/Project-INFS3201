const { MongoClient } = require('mongodb')
const mongodb = require('mongodb')
const crypto = require('crypto')


const fs = require('fs').promises;
const fs1= require('fs')

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
    if (!fs1.existsSync(`${__dirname}/uploads`)){
        fs1.mkdirSync(`${__dirname}/uploads`);
    }
    let binaryData = await fs.readFile(file.path)
    data.image=binaryData
    console.log(data)
    let result = await catloc.insertOne(data);
    console.log("Image Uploaded")
    let files = await fs.readdir(`${__dirname}/uploads`)
    for(f of files){
        await fs.unlink(`${__dirname}/uploads/${f}`)
    }
    return result
}

module.exports = {
    startSession,
    findEmail,
    updatePassword,
    getSession,
    deleteSession,
    getUserDetails,
    getCatSites,
    uploadReport
}