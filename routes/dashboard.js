const express = require("express");
const axios = require("axios");
const router = express.Router();

const BASE = process.env.BASE_ID;
const TOKEN = process.env.AIRTABLE_API_KEY;

const headers = {
 Authorization: `Bearer ${TOKEN}`
};

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

  /* TASK TYPE */

  const taskSummary = {};

  tasks.forEach(t => {

   const type = t.fields["Loại nghiệp vụ"] || "Khác";

   taskSummary[type] = (taskSummary[type] || 0) + 1;

  });

  /* TASK STATUS */

  const statusSummary = {
   "Đang xử lý": 0,
   "Hoàn thành": 0,
   "Lỗi": 0
  };

  tasks.forEach(t => {

   const status = t.fields["Tình trạng"];

   if (statusSummary[status] !== undefined) {
    statusSummary[status]++;
   }

  });

  /* PRODUCT ISSUE */

  const productCount = {};

  tasks.forEach(t => {

   const product = t.fields["ID_San_Pham"]?.[0];

   if (product) {
    productCount[product] = (productCount[product] || 0) + 1;
   }

  });

  const productMap = {};

  products.forEach(p => {
   productMap[p.id] = p.fields["ID_San_Pham"];
  });

  const topProducts = Object.entries(productCount)
   .sort((a, b) => b[1] - a[1])
   .slice(0, 5)
   .map(p => ({
    name: productMap[p[0]] || "Unknown",
    count: p[1]
   }));

  res.json({

   robots: robots.length,

   products: products.length,

   activeTasks: statusSummary["Đang xử lý"],

   completedTasks: statusSummary["Hoàn thành"],

   task_summary: taskSummary,

   robot_status: statusSummary,

   top_products: topProducts

  });

 } catch (err) {

  console.log(err);

  res.status(500).json({ error: "Dashboard API error" });

 }

});

module.exports = router;