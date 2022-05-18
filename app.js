const express=require('express')
const cors =require('cors');
const app=express();



app.use(express.json());
app.use(cors());


app.use('/',(req,res)=>{
    res.send('je suis un projet nodejs');
})

module.exports=app