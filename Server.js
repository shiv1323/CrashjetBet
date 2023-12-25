const express = require("express");
const app = express();

app.use(express.json());

const CrashBetRoutes = require("./Routes/route");
app.use("/api/v1", CrashBetRoutes);

app.listen(3000, () => {
  console.log("listening at port 3000");
});