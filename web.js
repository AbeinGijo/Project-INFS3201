const express=require('express')
const business = require('./business.js')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const handlebars = require('express-handlebars')
const fs1= require('fs')
const prompt = require('prompt-sync')()
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

let app = express()

app.set('views', __dirname+"/templates")
app.set('view engine', 'handlebars')
app.engine('handlebars', handlebars.engine())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use('/css', express.static(__dirname + "/css"))
app.use('/assets', express.static(__dirname + "/assets"))
app.use('/vendors', express.static(__dirname + "/vendors"))

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
            res.redirect('/myposts')
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

app.get('/myposts',async (req,res)=>{
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
    let data = await business.getCatSites()
    res.render(`memberposts`,{data:data,
                                pageTitle:"My Posts",
                                helpers:{toString}})

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
    
    res.render('member',{pageTitle:'Member Page'})

})
app.post('/member',upload.single('image'),async(req,res) =>{
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
    
    let data= req.body
    data.username=sd.data.username
    console.log(data)
    let file = req.file
    if(await business.uploadReport(data,file)){
        res.render('member',{pageTitle:'Member Page',message:"Report Updated"})
    }

})    


function toString(x){
    return x.toString ('base64')    
}  



app.get("/register",async(req,res)=>{
    // Render the register page with no layout and an optional message
    res.render('register',{layout:undefined, message:req.query.message})
})


// Post request for the register page
app.post('/register', async (req, res) =>{
    // Get the form data from the request body
    let name = req.body.username
    let email = req.body.email
    let pass = req.body.password
    let confirmpass = req.body.confirm
    // let accType = req.body.account_type
    // console.log(accType)
    
    // Check if any of the required fields are empty
    if (name == "" || email == "" || pass == "" || confirmpass == ""){
        // Redirect to the register page with an error message
        res.redirect("/register?message=please dont forget to fill all the fields properly!")
        return
    }
  
    // Check if the password and confirmation password match
    if (pass === confirmpass){

        // Create a new account object

        let newaccount = {username: name, email: email, password: pass, AccountType: accType}

        // Register the new account
        let signin = await business.registerAccount(newaccount)
        // Check if the registration was successful
        if (!signin){
            // Redirect to the register page with an error message
            res.redirect("/register?message=You are not eligible for signin because of having same username or email.")
            return
        }
        else
        {
          // Redirect to the login page with a success message
          res.redirect("/login?message=Welcome user! You have been registered to out community!")
        }
    }
    else
    {
        // Redirect to the register page with an error message
        res.redirect("/register?message=The passwords you entered have not matched!")
    }
})


// Get request for the reset password page
app.get('/reset',(req,res)=>{
    // Render the reset password page with no layout and an optional message
    res.render('reset',{layout:undefined, message:req.query.message})
})

// Post request for the reset password page
app.post("/reset", async (req,res)=> {
    // Get the form data from the request body
    let email = req.body.email    //reading email from body
    let change_password = req.body.change_password  //reading the changed passwordfrom body
    let new_password = req.body.new_password    //reading new password from body
    let message = req.query.message

    // Check if the email exists in the system
    let check  = await business.findEmail(email)    //checking email 
    if (check){
        // Prompt the user to confirm if they want to change their password
        let change = prompt("Will you change your password?(yes/no):")

        // Check if the user confirmed to change their password
        if(change === "yes"){
            // Check if the new password and confirmation password match
            if (new_password === change_password){
                // Update the user's password
                await business.updatePassword(email,new_password)
                // Log a success message
                console.log(`Your password has been changed to ${req.body.new_password} sucessfully, congratulation! You can continue to navigate now.`)
                // Redirect to the home page with a success message
                res.redirect("/?message=Password Reset is complete!")
            }else{
                // Redirect to the reset password page with an error message
                res.redirect("/reset?message=Password does not match with the given password!")
            }
            return

        }
        else
        {
            // Redirect to the reset password page with an error message
            res.redirect("/reset?message=Email has not been found here!")
        }
    }
    // Redirect to the reset password page with an error message
    res.redirect("/reset?message=Email has not been found here!")
  }
)





app.get('/dashboard', async (req, res) => {

    let sessionKey = req.cookies.session;

    if (!sessionKey) {
      res.redirect('/login?session=true');
      return;
    }
  
    let sessionData = await business.getSession(sessionKey);
    if (!sessionData || sessionData.data.type !== 'admin') {
      res.redirect('/login?session=true');
      return;
    }
  
 
    let feedingStations = await business.getCatSites();
    res.render('dashboard', {  feedingStations }); 

 
})


app.get('/urgent', async (req, res) => {
    console.log("Urgent  requested");
    let sessionKey = req.cookies.session;
  
    if (!sessionKey) {
      res.redirect('/login?session=true');
      return;
    }
  
    let sessionData = await business.getSession(sessionKey);
    if (!sessionData || sessionData.data.type !== 'admin') {
      res.redirect('/login?session=true');
      return;
    }
  
    let urgentItems = await business.getUrgentSites();
    res.render('urgent', { urgentItems });
  });


app.use(function(req,res){
    res.status(404).render('404',{layout:undefined});
})


app.listen(8000, () => {
    console.log("Application has started")
})
