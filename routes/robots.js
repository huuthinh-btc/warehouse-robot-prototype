const express = require("express");

const router = express.Router();

router.get("/", (req,res)=>{

 const robots = [
  {id:"R1",status:"Idle"},
  {id:"R2",status:"Working"},
  {id:"R3",status:"Charging"}
 ];

 res.json(robots);

});

module.exports = router;