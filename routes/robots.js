const express = require("express");
const axios = require("axios");
const router = express.Router();

const BASE = process.env.BASE_ID;
const TOKEN = process.env.AIRTABLE_API_KEY;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json"
};

/* ===============================
GET ROBOT STATUS
=============================== */

router.get("/", async (req, res) => {

try {

const [robotsRes, tasksRes, productsRes] = await Promise.all([

axios.get(`https://api.airtable.com/v0/${BASE}/Robot`, { headers }),
axios.get(`https://api.airtable.com/v0/${BASE}/Nhiem_Vu`, { headers }),
axios.get(`https://api.airtable.com/v0/${BASE}/San_Pham`, { headers })

]);

const robots = robotsRes.data.records;
const tasks = tasksRes.data.records;
const products = productsRes.data.records;

/* MAP ROBOT */

const robotIdMap = {};
robots.forEach(r=>{
robotIdMap[r.id] = r.fields["ID_Robot"];
});

/* MAP PRODUCT */

const productMap = {};
products.forEach(p=>{
productMap[p.id] = p.fields["ID_San_Pham"];
});

/* MAP TASK */

const taskMap = {};

tasks
.sort((a,b)=>b.createdTime.localeCompare(a.createdTime))
.forEach(t=>{

const f = t.fields;

if(!f["ID_Robot"]) return;

const robotRecordId = f["ID_Robot"][0];
const robotName = robotIdMap[robotRecordId];

if(!robotName) return;

if(taskMap[robotName]) return;

const productRecordId = f["ID_San_Pham"]?.[0];

const productName = productMap[productRecordId] || "-";

taskMap[robotName] = {

task: f["Loại nghiệp vụ"] || "N/A",
area: productName,
time: new Date(t.createdTime).toLocaleTimeString()

};

});

/* BUILD RESULT */

const result = robots.map(r=>{

const robotName = r.fields["ID_Robot"];

const task = taskMap[robotName] || {
task:"Idle",
area:"-",
time:"-"
};

return{

id: robotName,
status: r.fields["Trạng thái"] || "Idle",
task: task.task,
area: task.area,
time: task.time

};

});

res.json(result);

}catch(err){

console.error(err.response?.data || err.message);
res.status(500).json({error:"Robot API error"});

}

});

/* ===============================
CREATE TASK
=============================== */

router.post("/tasks", async (req,res)=>{

try{

const {robot,product,taskType} = req.body;

const [robotsRes,productsRes] = await Promise.all([

axios.get(`https://api.airtable.com/v0/${BASE}/Robot`,{headers}),
axios.get(`https://api.airtable.com/v0/${BASE}/San_Pham`,{headers})

]);

const robotRecord = robotsRes.data.records.find(
r=>r.fields["ID_Robot"]===robot
);

const productRecord = productsRes.data.records.find(
p=>p.fields["ID_San_Pham"]===product
);

if(!robotRecord || !productRecord){

return res.status(400).json({error:"Robot/Product not found"});

}

const newTask = await axios.post(

`https://api.airtable.com/v0/${BASE}/Nhiem_Vu`,

{
fields:{

"Loại nghiệp vụ":taskType,
"Tình trạng":"Đang xử lý",
"ID_Robot":[robotRecord.id],
"ID_San_Pham":[productRecord.id]

}

},

{headers}

);

res.json(newTask.data);

}catch(err){

console.error(err.response?.data || err.message);
res.status(500).json({error:"Create task error"});

}

});

module.exports = router;