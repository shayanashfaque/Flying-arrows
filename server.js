const express = require('express');
const app= express();
require('dotenv').config();
const cors= require('cors');

const EntertainmentRoute=require('./Routers/Entertainment');


// Middleware layer
app.use(express.json());
app.use(cors())
app.use("/entertainment",EntertainmentRoute);


app.get('/',(req,res)=>{
    res.json("Welcome to the flying arrow");
})





app.listen(process.env.PORT,()=>{

    console.log(`Server running at ${process.env.PORT}`)
})
