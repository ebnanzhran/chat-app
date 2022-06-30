const path = require('path') ;
const http = require('http');
const express =require("express");
const socketio=require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin ,  
    getCurrentUser ,
     userLeave , 
     getRoomUsers
    } = require('./utils/Users')

const app = express();

const server =http.createServer(app);
const io = socketio(server)
//Set static folder

app.use(express.static(path.join(__dirname,'public')))

const botName = 'ChatCord Bot';

//Run when clint connects
io.on('connection' , socket=>{
    socket.on('joinRoom', ({username,room})=>{
       
        const user = userJoin(socket.id , username , room)
        socket.join(user.room);


    socket.emit('message',
     formatMessage(botName,
        'Welcome to chatCord'));
    // Broadcast when user connects
    socket.broadcast.to(user.room).emit(
        'message',
         formatMessage(botName,
            `${user.userName} user has joined the chat`));

            //Send users and room information
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            })

    });
    

    socket.on('chatMessage' , msg =>{
const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message' ,
        formatMessage(user.userName, msg));
    });
    socket.on('disconnect' , ()=>{

        const user = userLeave(socket.id)
       
        if(user){
            io.to(user.room).emit('message',
            formatMessage(botName,`${user.userName} has left the chat`));
        }

         //Send users and room information
         io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        })

       
    });
});



const PORT =3000 || process.env.PORT;

server.listen(PORT,()=> console.log(`Server running on port ${PORT}`));
