
const express=require('express')
const business = require('./business.js')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const handlebars = require('express-handlebars')
const path = require('path')

let app = express()
app.set('views', __dirname+"/templates")
app.set('view engine', 'handlebars')
app.engine('handlebars', handlebars.engine())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use('/css', express.static(__dirname + "/css"))
app.use('/assets', express.static(__dirname + "/assets"))


app.get('/',async (req,res) =>{
    let catloc = await business.getCatSites()
    res.render('catloc',{layout:undefined,
                            catLocs: catloc})
})



app.get('/login',(req,res) =>{
    let message=req.query.message
    let session= req.query.session
    res.render('login',{layout:undefined,
                        message:message,
                        session:session})
})

app.post('/login',async(req,res) =>{
    let username= req.body.username
    let password = req.body.password
    let session = await business.attemptLogin(username,password)
    if (session) {
        if(session.data.type==='admin'){
            res.cookie('session', session.key, {expires: session.expiry})
            res.redirect('/admin')
        }
        else if(session.data.type==='standard'){
            res.cookie('session', session.key, {expires: session.expiry})
            res.redirect('/member')
        }
    }
    else {
        res.redirect('/login?message=Invalid Credentials')
    }
})

app.get('/admin',async(req,res) =>{
    let sessionKey = req.cookies.session
    if (!sessionKey) {
        res.redirect('/login?session=true')
        return
    }
    let sd = await business.getSession(sessionKey)

    if (!sd || sd.data.type !=='admin') {
        res.redirect("/login?session=true")
        return
    }
    res.render('admin',{layout:undefined})

})

app.get('/member',async(req,res) =>{
    let sessionKey = req.cookies.session
    if (!sessionKey) {
        res.redirect('/login?session=true')
        return
    }
    let sd = await business.getSession(sessionKey)
    if (!sd|| sd.data.type!=='standard') {
        res.redirect("/login?session=true")
        return
    }
    res.render('member')

})
// Reset password route and use
app.get('/reset',(req,res)=>{
    res.render('reset',{layout:undefined, message:req.query.message})
  })

  app.post("/reset", async (req,res)=> {
    let email = req.body.email    //reading email from body
    let change_password = req.body.change_password  //reading the changed passwordfrom body
    let new_password = req.body.new_password    //reading new password from body
    let message = req.query.message


    let check  = await business.findEmail(email)    //checking email 
    if (check){
      let change = prompt("Will you change your password?(yes/no):")

      if(change === "yes"){
        if (new_password === change_password){
            await business.updatePassword(email,new_password)
            res.redirect("/?message=Password Reset is complete!")
        }else{
            res.redirect("/reset?message=Password Does not match with the given password")
        }
        return

      }
      else
      {
        res.redirect("/reset?message=Email has not been found here!")
      }
    }
    res.redirect("/reset?message=Email has not been found here!")
  }
)

app.use(function(req,res){
    res.status(404).render('404',{layout:undefined});
})

app.listen(8000, () => {
    console.log("Application has started")
})