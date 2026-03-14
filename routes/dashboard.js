const express = require("express");

const router = express.Router();

router.get("/", (req,res)=>{

 res.json({
  system:"Warehouse Management System",
  robots:3,
  status:"Running"
 });

});

module.exports = router;