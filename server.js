const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ROUTES */

const productRoutes = require("./routes/products");
const robotRoutes = require("./routes/robots");
const dashboardRoutes = require("./routes/dashboard");
const salesRoutes = require("./routes/sales");
const warehouseRoutes = require("./routes/warehouse");

app.use("/api/products", productRoutes);
app.use("/api/robots", robotRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/warehouse", warehouseRoutes);

/* SERVER */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("\n==============================");
  console.log("🚀 Server running");
  console.log("Port:", PORT);
  console.log("Login:", `http://localhost:${PORT}/role.html`);
  console.log("==============================\n");
});