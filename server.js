const mongoose =require('mongoose')
const dotenv =require('dotenv')
const app=require('./app')
dotenv.config({path:'./config.env'})

//configuration du serveur mongoose
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
 
mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'));
 
const port=process.env.PORT ||3000
const server=app.listen(port,()=>{
    console.log(`Le serveur est lancé sur le port ${port}`)
})

//Detect all problem in apps
process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    console.log('UNHANDLER REJECTION! 🧯 Shutting down...')
    server.close(()=>{
        process.exit(1); //met fin au programme
    });
});
