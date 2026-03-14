const express = require("express");
const axios = require("axios");

const router = express.Router();

const BASE = process.env.BASE_ID;
const TOKEN = process.env.AIRTABLE_API_KEY;
const TABLE = "tbln9pWvSKVC3tjJQ";   // table San_Pham


/* =========================
   GET PRODUCTS
========================= */

router.get("/", async (req,res)=>{

try{

const response = await axios.get(

`https://api.airtable.com/v0/${BASE}/${TABLE}`,

{
headers:{
Authorization:`Bearer ${TOKEN}`
}
}

)

const products = response.data.records.filter(
r => r.fields && r.fields.ID_San_Pham
)

res.json(products)

}

catch(error){

console.log("GET ERROR:", error.response?.data || error.message)

res.status(500).json({error:"Airtable error"})

}

})



/* =========================
   ADD PRODUCT
========================= */

router.post("/", async (req,res)=>{

try{

const {name,rfid,expiry,stock,minStock} = req.body

if(!name || !rfid){

return res.status(400).json({
error:"Missing product name or RFID"
})

}

const response = await axios.post(

`https://api.airtable.com/v0/${BASE}/${TABLE}`,

{
records:[
{
fields:{
ID_San_Pham:name,
"Mã RFID":rfid,
"Hạn sử dụng":expiry,
"Tồn tối thiểu":Number(minStock) || 0,
"Số lượng hiện tại":Number(stock) || 0
}
}
]
},

{
headers:{
Authorization:`Bearer ${TOKEN}`,
"Content-Type":"application/json"
}
}

)

res.json(response.data)

}

catch(error){

console.log("ADD ERROR:", error.response?.data || error.message)

res.status(500).json({
error:"Add product failed",
detail:error.response?.data
})

}

})

module.exports = router