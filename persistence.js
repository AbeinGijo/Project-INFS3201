const mongodb = require('mongodb')

let client= undefined

async function connectDatabase(){
    if (!client){
        client = await  new MongoClient("")
    }
}