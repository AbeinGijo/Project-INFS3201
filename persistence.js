const mongodb = require('mongodb')

let client= undefined
let db = undefined 
let session = undefined
let catloc = undefined

async function connectDatabase(){
    if (!client){
        client = await  new MongoClient("mongodb+srv://basharsoad:12class34@cluster0.d6lyly6.mongodb.net/")
        await client.connect()
        db = client.db("project")
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
    await session.insertOnt(sd)
}


//function to save session.
async function saveSession(uuid, expiry, data){
    let db =await connectDatabase()
    await db[1].replaceOne({SessionKey:uuid, expiry:expiry, data:data})
}


// finding the session based on the session key.
// The 'getSession' function retrieves a session based on the session key

async function getSession(key){
    await connectDatabase()
    let db = client.db('project')
    let session = db.collection('sessionData')
    let final_session  = await session.find({sessionNumber:key})
    let result = await final_session.toArray()
    return result[0]
}

//function for deleting the session.
// The 'deleteSession' function deletes a session from the 'sessionData' collection based on the session key.

async function deleteSession(key){
    await connectDatabase()
    db = client.db('project')
    session = db.collection("sessionData")
    await session.deleteOne({sessionNumber:key})
}

module.exports = {
    startSession,
    saveSession,
    getSession,
    deleteSession,
}