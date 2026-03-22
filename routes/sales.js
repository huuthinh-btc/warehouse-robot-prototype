const express = require("express");
const axios = require("axios");
const router = express.Router();

const BASE = process.env.BASE_ID;
const TOKEN = process.env.AIRTABLE_API_KEY;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json"
};

router.post("/", async (req, res) => {

  try {

    const { productName, quantity } = req.body;

    /* VALIDATE */
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
    const min = product.fields["Tồn tối thiểu"] || 0;

    /* UC-08: KHÔNG CHO ÂM KHO */
    if (quantity > current) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    const newStock = current - quantity;

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

    /* ===== LOGIC USECASE ===== */

    /* CASE 1: HẾT HÀNG → KHÔNG TẠO TASK */
    if (newStock === 0) {
      return res.json({
        message: "Hết hàng → cần nhập kho (UC-05)",
        newStock
      });
    }

    /* CASE 2: CHẠM NGƯỠNG → UC-01 */
    if (newStock <= min) {

      const robotsRes = await axios.get(
        `https://api.airtable.com/v0/${BASE}/Robot`,
        { headers }
      );

      /* chọn robot sẵn sàng */
      const robot = robotsRes.data.records.find(
        r => r.fields["Trạng thái"] === "Sẵn sàng"
      );

      if (!robot) {
        return res.json({
          message: "Không có robot khả dụng",
          newStock
        });
      }

      const shelf = product.fields["Vi_tri_ke"]?.[0];

      await axios.post(
        `https://api.airtable.com/v0/${BASE}/Nhiem_Vu`,
        {
          fields: {
            "Loại nghiệp vụ": "Bổ sung kệ hàng",
            "Tình trạng": "Đang xử lý",
            "ID_Robot": [robot.id],
            "ID_San_Pham": [product.id],
            ...(shelf && { "Vi_tri_ke": [shelf] })
          }
        },
        { headers }
      );

      return res.json({
        message: "Đã tạo task châm hàng (UC-01)",
        newStock
      });
    }

    res.json({
      message: "Sale OK",
      newStock
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Sale error" });
  }

});

module.exports = router;