
const persistence= require('./persistence.js')
const crypto = require('crypto')

function computeHash(p){
    let hash = crypto.createHash('sha512')
    hash.update(p)
    return hash.digest('hex')
}


async function attemptLogin(username,password){
    let details = await persistence.getUserDetails(username)
    password = computeHash(password)

    if(!details || details.password !=  password){
        return undefined
    }
    let sessionKey = crypto.randomUUID()
    let sd = {
        key: sessionKey,
        expiry: new Date(Date.now() + 1000*60*5),
        data: {
            username: details.user,
            type:details.AccountType
        }
    }
    await persistence.startSession(sd)
    return sd
}



async function getCatSites(){
    return await persistence.getCatSites()
}

async function terminateSession(key) {
    if (!key) {
        return
    }
    await persistence.terminateSession(key)
}

async function getSession(key) {
    return await persistence.getSession(key)
}



async function terminateSession(key){
    return await persistence.deleteSession(key)
}

// password reset
async function findEmail(email){
    return await persistence.findEmail(email)
  }
  async function updatePassword(email,password){
    return await persistence.updatePassword(email,password)
  }

module.exports = {
    findEmail,
    updatePassword,
    getSession,
    terminateSession,
    attemptLogin,getCatSites

}