const express = require('express');
const app= express();
require('dotenv').config();

app.get('/',(req,res)=>{
    res.json("Welcome to the flying arrow");
})





app.listen(process.env.PORT,()=>{

    console.log(`Server running at ${process.env.PORT}`)
})
