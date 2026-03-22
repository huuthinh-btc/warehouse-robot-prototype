const express = require("express");
const axios = require("axios");
const router = express.Router();

const BASE = process.env.BASE_ID;
const TOKEN = process.env.AIRTABLE_API_KEY;

const headers = {
  Authorization: `Bearer ${TOKEN}`
};

/* =========================
GET PRODUCTS (TỒN KHO)
========================= */

router.get("/", async (req, res) => {

  try {

    const products = await axios.get(
      `https://api.airtable.com/v0/${BASE}/San_Pham`,
      { headers }
    );

    const result = products.data.records.map(p => {

      const f = p.fields;

      return {
        id: p.id,
        name: f["ID_San_Pham"] || "Unknown",
        stock: f["Số lượng hiện tại"] || 0,
        minStock: f["Tồn tối thiểu"] || 0,
        expiry: f["Hạn sử dụng"] || "-"
      };

    });

    res.json(result);

  } catch (err) {

    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Get products error" });

  }

});

module.exports = router;