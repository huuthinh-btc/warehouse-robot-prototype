const express = require("express");
const axios = require("axios");
const router = express.Router();

const BASE = process.env.BASE_ID;
const TOKEN = process.env.AIRTABLE_API_KEY;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json"
};

router.post("/import", async (req, res) => {

  try {

    const { productName, quantity } = req.body;

    if (!productName || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const productsRes = await axios.get(
      `https://api.airtable.com/v0/${BASE}/San_Pham`,
      { headers }
    );

    const product = productsRes.data.records.find(
      p => p.fields["ID_San_Pham"] === productName
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const current = product.fields["Số lượng hiện tại"] || 0;
    const newStock = current + quantity;

    /* UPDATE STOCK */
    await axios.patch(
      `https://api.airtable.com/v0/${BASE}/San_Pham`,
      {
        records: [{
          id: product.id,
          fields: { "Số lượng hiện tại": newStock }
        }]
      },
      { headers }
    );

    /* UC-05: TẠO TASK NHẬP KHO */

    await axios.post(
      `https://api.airtable.com/v0/${BASE}/Nhiem_Vu`,
      {
        fields: {
          "Loại nghiệp vụ": "Nhập kho mới",
          "Tình trạng": "Đang xử lý",
          "ID_San_Pham": [product.id]
        }
      },
      { headers }
    );

    res.json({
      message: "Nhập kho thành công",
      newStock
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Import error" });
  }

});

module.exports = router;