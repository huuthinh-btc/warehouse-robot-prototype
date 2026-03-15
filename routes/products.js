const express = require("express");
const axios = require("axios");
const router = express.Router();

const BASE = process.env.BASE_ID;
const TOKEN = process.env.AIRTABLE_API_KEY;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json"
};

/* =========================
GET PRODUCTS
========================= */

router.get("/", async (req, res) => {

  try {

    const [products, categories, locations] = await Promise.all([

      axios.get(`https://api.airtable.com/v0/${BASE}/San_Pham`, { headers }),
      axios.get(`https://api.airtable.com/v0/${BASE}/Danh_Muc`, { headers }),
      axios.get(`https://api.airtable.com/v0/${BASE}/Vi_Tri_Ke`, { headers })

    ]);

    /* MAP CATEGORY */

    const catMap = {};
    categories.data.records.forEach(r => {
      catMap[r.id] = r.fields["Tên danh mục"];
    });

    /* MAP LOCATION */

    const locMap = {};
    locations.data.records.forEach(r => {
      locMap[r.id] = r.fields["Mã vị trí"];
    });

    /* BUILD RESPONSE */

    const result = products.data.records.map(r => {

      const f = r.fields;

      const catId = f["Danh_muc_ID"]?.[0];
      const locId = f["Vi_Tri_Ke"]?.[0];

      return {
        id: r.id,
        fields: f,
        displayCategory: catMap[catId] || "-",
        displayLocation: locMap[locId] || "-"
      };

    });

    res.json(result);

  } catch (err) {

    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "Airtable error" });

  }

});


/* =========================
ADD PRODUCT
========================= */

router.post("/", async (req, res) => {

  try {

    const { name, rfid, expiry, minStock, stock, categoryId, shelfLocation } = req.body;

    if (!name || !rfid)
      return res.status(400).json({ error: "Thiếu name hoặc RFID" });


    /* CHECK RFID DUPLICATE */

    const check = await axios.get(
      `https://api.airtable.com/v0/${BASE}/San_Pham?filterByFormula={Mã RFID}='${rfid}'`,
      { headers }
    );

    if (check.data.records.length > 0)
      return res.status(400).json({ error: "RFID đã tồn tại" });


    /* =========================
       FIND CATEGORY
    ========================= */

    let catId = null;

    if (categoryId) {

      const catTable = await axios.get(
        `https://api.airtable.com/v0/${BASE}/Danh_Muc`,
        { headers }
      );

      const found = catTable.data.records.find(
        r => r.fields["Tên danh mục"] === categoryId
      );

      if (found) catId = found.id;

    }


    /* =========================
       FIND LOCATION (FIX HERE)
    ========================= */

    let locId = null;

    if (shelfLocation) {

      const locTable = await axios.get(
        `https://api.airtable.com/v0/${BASE}/Vi_Tri_Ke`,
        { headers }
      );

      const found = locTable.data.records.find(
        r => r.fields["Mã vị trí"] === shelfLocation
      );

      if (found) locId = found.id;

    }


    /* =========================
       CREATE PRODUCT
    ========================= */

    const body = {

      fields: {

        "ID_San_Pham": name,
        "Mã RFID": rfid,
        "Hạn sử dụng": expiry || null,
        "Tồn tối thiểu": Number(minStock) || 0,
        "Số lượng hiện tại": Number(stock) || 0,
        "Danh_muc_ID": catId ? [catId] : [],
        "Vi_Tri_Ke": locId ? [locId] : []

      }

    };

    const response = await axios.post(
      `https://api.airtable.com/v0/${BASE}/San_Pham`,
      body,
      { headers }
    );

    res.json(response.data);

  } catch (err) {

    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "Add product failed" });

  }

});

module.exports = router;