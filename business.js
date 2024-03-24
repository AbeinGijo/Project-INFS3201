const crypto = require('crypto')
const  persistence = require('./persistence')

async function startSession(data){
    let sessionKey = crypto.randomUUID()
    let sd = {
        sessionNumber: sessionKey,
        expiry: new Date(Date.now()+ 100*60*5),
        data:data
    }
    await persistence.startSession(sd)
    return sd
}

async function getSession(key){
    return await persistence.getSession(key)
}

async function terminateSession(key){
    return await persistence.deleteSession(key)
}

module.exports = {
    startSession,
    getSession,
    terminateSession,
}