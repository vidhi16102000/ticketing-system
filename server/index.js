require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());


//global error handling-------------------------
app.use((err, req, res, next) => {
    console.error("Unhandles error:",err.message);
    res.status(500).json({message:"Internal server error"});
})

app.use("/api/auth",    require("./routes/auth"));
app.use("/api/tickets", require("./routes/tickets"));

app.get("/", (req, res) => {
  res.json({ message: "Tickting api running" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("server is up and running on http://localhost:5000");
  });
}).catch((error)=>{
    console.error("error in db connection:",error.message);
    process.exit(1);
});
