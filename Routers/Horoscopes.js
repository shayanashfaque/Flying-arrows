const express=require('express');
const router=express.Router();

Router.get('/',async(req,res)=>{
res.json("THis is the Horoscopes section");

})
module.exports=router;