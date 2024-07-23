const express  = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const storage = require('node-sessionstorage');
const session = require('express-session');


const app = express(); 
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended:true}));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.set('views',path.join(__dirname,'public'));
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');

app.get('/',(req,res)=>{
    res.render('name.html');
})


app.post('/',(req,res)=>{
    if( req.body.nome != '' || req.body.nome != null ){
        storage.setItem('nomeSession', req.body.nome);
        console.log(storage.getItem('nomeSession'));
        var nome =  req.session.nome = req.body.nome;
        
        res.render('chat.html',{nome});
    
    }else{
        res.render('name.html');
    }
})

let messages = [];


io.on('connection', socket => {
    // console.log("socket conectou com ID "+socket.id);

    socket.emit('previousMessages',messages);

    socket.on('sendMessage', data => {
        messages.push(data);
        socket.broadcast.emit('receivedMessage',data);
    })
});

server.listen(3000, ()=> console.log("Servidor aberto , http://localhost:3000"));