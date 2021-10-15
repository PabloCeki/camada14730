const express = require('express')
const cookieParser = require('cookie-parser');
const session = require('express-session');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

let usuarios = []

// app.post('/login',(req,res)=>{
//     let {nombre,password} = req.body;
//     let user = usuarios.filter(usuario => usuario.nombre == nombre && usuario.password == password)
//     if (user.length){
//         req.session.nombre = nombre;
//         req.session.contador = 0
//         res.redirect('/')
//     }else
//     res.send('Error al loguearse...')
    
//     })
passport.use('login', new LocalStrategy({
passReqToCallback:true    
},
function (req,username,password,done){
    let user = usuarios.filter(usuario => usuario.username == username)
    if (!user) return done(null,false)
    let success = user.username == username && user.password == password;
    if (!success) return done(null,false)
    user.count = 0;
    return done(null,user);
})
);
// app.post('/register',(req,res)=>{

//     let {nombre} = req.body;  // { nombre:'pdceki+profesor@gmail.com',password:'123abc'}
//     let user = usuarios.filter(usuarios => usuarios.nombre == nombre)
//     if (!user.length){
//         usuarios.push(req.body)
//         req.session.nombre = nombre;
//         req.session.contador = 0;
//         res.redirect('/')
//     }

// })
passport.use('register', new LocalStrategy({
    passReqToCallback:true    
    },
    function (req,username,password,done){
       createUser = function(){
        
        if (usuarios.filter(usuario => usuario.username == username).length) return done(null,false)
        let user = req.body;
        user.username = username;
        user.password = password;
        user.count = 0;
        usuarios.push(user)
        return done(null,user)
     }
       process.nextTick(createUser)

    })
    );

passport.serializeUser(function(user,done){
    done(null,user.username)
})
passport.deserializeUser(function(username,done){
    let usuario = usuarios.find(usuario => usuario.username == username)
    done(null,usuario);
})



const app = express();
app.use(cookieParser())
app.use(session({
    secret:'89s89dsd',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:60000
    }
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({extended:true}))



app.get('/',(req,res)=>{

    if (req.isAuthenticated())
        res.redirect('/datos')
    else
        res.redirect('/login')

})
app.get('/info',(req,res)=>{

    res.json(usuarios)

})
app.get('/my-session',(req,res)=>{
    res.send(req.session)
})
app.get('/login',(req,res)=>{
res.send('/login') /// nuestro form de logeo
})
// app.post('/login',(req,res)=>{
// let {nombre,password} = req.body;
// let user = usuarios.filter(usuario => usuario.nombre == nombre && usuario.password == password)
// if (user.length){
//     req.session.nombre = nombre;
//     req.session.contador = 0
//     res.redirect('/')
// }else
// res.send('Error al loguearse...')

// })
app.post('/login',passport.authenticate('login',{failureRedirect:'/error-login'}), (req,res)=>{
    res.redirect('/')
})
app.post('/register',passport.authenticate('register',{failureRedirect:'/error-register'}),(req,res)=>{
    res.redirect('/')
})
app.get('/error-login',(req,res)=>{
    res.send('Error al loguearse')
})
app.get('/error-register',(req,res)=>{
    res.send('Error al registrarse')
})
app.get('/logout',(req,res)=>{
req.logout();
res.redirect('/')
})

app.get('/register',(req,res)=>{
res.send('/register') // nuestro form de registro
})
// app.post('/register',(req,res)=>{

//     let {nombre} = req.body;  // { nombre:'pdceki+profesor@gmail.com',password:'123abc'}
//     let user = usuarios.filter(usuarios => usuarios.nombre == nombre)
//     if (!user.length){
//         usuarios.push(req.body)
//         req.session.nombre = nombre;
//         req.session.contador = 0;
//         res.redirect('/')
//     }

// })
function checkIsLogin(req,res,next){
    if (req.isAuthenticated())
     next()
     else
     res.redirect('/login')

}
app.get('/hide',checkIsLogin,(req,res)=>{

res.send('Soy una ruta protegida....')

})
app.get('/datos',(req,res)=>{
if (req.isAuthenticated()){
    if (!req.user.count) req.user.count  = 0;
    req.user.count++;
    res.send('Estas autenticado')
}else
res.redirect('/login')
})

app.listen(5050,()=>console.log('Listining...'))