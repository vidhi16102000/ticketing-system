const sql = require("mssql");
require("dotenv").config();

const config = {
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    connectionTimeout: 30000
};

let pool;

async function connectDB() {
  try {
      pool = await sql.connect(config);
      console.log("Connected to SQL Server (SSMS)");
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    process.exit(1);
  }
}

async function getPool() {
  if (!pool) await connectDB();
  return pool;
}

getPool()
module.exports = { connectDB, getPool, sql };
