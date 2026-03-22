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

    const [robotsRes, tasksRes, productsRes, shelvesRes] = await Promise.all([
      axios.get(`https://api.airtable.com/v0/${BASE}/Robot`, { headers }),
      axios.get(`https://api.airtable.com/v0/${BASE}/Nhiem_Vu`, { headers }),
      axios.get(`https://api.airtable.com/v0/${BASE}/San_Pham`, { headers }),
      axios.get(`https://api.airtable.com/v0/${BASE}/Vi_Tri_Ke`, { headers }) // 🔥 bắt buộc
    ]);

    const robots = robotsRes.data.records;
    const tasks = tasksRes.data.records;
    const products = productsRes.data.records;
    const shelves = shelvesRes.data.records;

    /* MAP shelfId → shelfName */

    const shelfMap = {};
    shelves.forEach(s => {
      shelfMap[s.id] = s.fields["Mã vị trí"];
    });

    /* MAP product → shelfId */

    const productMap = {};
    products.forEach(p => {
      productMap[p.id] = {
        name: p.fields["ID_San_Pham"],
        shelfId: p.fields["Vi_Tri_Ke"]?.[0] // ✅ đúng kiểu
      };
    });

    /* MAP task */

    const taskMap = {};
    tasks
      .sort((a, b) => b.createdTime.localeCompare(a.createdTime))
      .forEach(t => {

        const robotId = t.fields["ID_Robot"]?.[0];
        const productId = t.fields["ID_San_Pham"]?.[0];

        if (!robotId || !productId) return;

        if (!taskMap[robotId]) {
          taskMap[robotId] = {
            task: t.fields["Loại nghiệp vụ"],
            productId: productId,
            time: new Date(t.createdTime).toLocaleTimeString()
          };
        }

      });

    /* BUILD RESULT */

    const result = robots.map(r => {

      const task = taskMap[r.id];

      let area = "-";

      if (task) {
        const shelfId = productMap[task.productId]?.shelfId;
        area = shelfMap[shelfId] || "-"; // 🔥 FIX CHUẨN
      }

      return {
        id: r.fields["ID_Robot"],
        status: r.fields["Trạng thái"],
        task: task ? task.task : "Idle",
        area: area,
        time: task ? task.time : "-"
      };

    });

    res.json(result);

  } catch (err) {

    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Robot API error" });

  }

});

module.exports = router;