
const persistence= require('./persistence.js')
const crypto = require('crypto')

function computeHash(p){
    let hash = crypto.createHash('sha512')
    hash.update(p)
    return hash.digest('hex')
}

async function attemptLogin(username,password){
    let details = await persistence.getUserDetails(username)
    // console.log(username)
    // console.log(password)
    password = computeHash(password)
    if(!details || details.password !=  password){
        return undefined
    }
    let sessionKey = crypto.randomUUID()
    let sd = {
        key: sessionKey,
        expiry: new Date(Date.now() + 1000*60*15),
        data: {
            username: details.username,
            type:details.AccountType
        }
    }
    await persistence.startSession(sd)
    return sd
}


async function registerAccount(account) {
    account.password=computeHash(account.password)
    return await persistence.registerAccount(account);
  }
async function updateNewuser(username,date){
    return await persistence.updateNewuser(username,date)
}

async function getCatSites(){
    return await persistence.getCatSites()
}

async function getMyPosts(sd){
    return await persistence.getMyPosts(sd)
}


async function getAllPosts(){
    return await persistence.getAllPosts()
}

async function getUrgentSites(){
    return await persistence.getUrgentSites() 
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

// This function is named `generateToken` and takes one argument `sessionID`
async function generateToken(sessionID){
    // Generate a random token 
    let token = Math.floor(Math.random()*1000000)

    // Get the session data for the given sessionID
    let sessionData = await persistence.getSession(sessionID);

    // Set the CSRF token for the session
    sessionData.csrfToken = token;
  
    await persistence.updateSession(sessionData);
    return token;
}

// This function is named `cancelToken` and takes one argument `sessionID`
async function cancelToken(sessionID){

    let sessionData = await persistence.getSession(sessionID);

    // Delete the CSRF token from the session data
    delete sessionData.csrfToken;

    await persistence.updateSession(sessionData);
}

// password reset
async function findEmail(email){

    return await persistence.findEmail(email)
  }
  async function updatePassword(email,password){
    return await persistence.updatePassword(email,password)
  }
  


async function updatePassword(email,password){
   password = computeHash(password)
   return await persistence.updatePassword(email,password)
}

async function uploadReport(data,file){
    data.lastVisitDate= new Date(data.lastVisitDate)
    data.foodLevel=Number(data.foodLevel)
    data.waterLevel=Number(data.waterLevel)
    data.noCats=Number(data.noCats)
    
    return await persistence.uploadReport(data,file)
}

async function getCatlocations(){
    return await persistence.getCatlocations()
}


module.exports = {
    findEmail,
    updatePassword,
    getSession,
    computeHash,
    terminateSession,
    attemptLogin,getCatSites,
    getUrgentSites,uploadReport,
    registerAccount,
    updateNewuser,
    getMyPosts,
    getCatlocations,
    cancelToken,
    getAllPosts,
    generateToken,

}