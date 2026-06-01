const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../config/db");

async function register(req, res) {
  const { name, email, password } = req.body;
  try {
    const pool = await getPool();
    const existing = await pool
      .request()
      .input("email", sql.NVarchar, email)
      .input("SELECT id FROM Users WHERE email = @email");

    if (existing.recordset.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool
      .request()
      .input("name", sql.NVarchar, name)
      .input("email", sql.NVarchar, email)
      .input("password", sql.NVarchar, hash)
      .query(`INSERT INTO Users (name, email, password)
                OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
                VALUES (@name, @email, @password)`);
    const user = result.recordset[0];

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.NVarchar, email)
      .query("SELECT * FROM Users WHERE email = @email AND is_active = 1");
    if (result.recordset.length === 0)
      return res.sttaus(401).json({ message: "Invalid credentials" });

    const user = result.recordset[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ messgae: "Invalid credentials" });

    await pool
      .request()
      .input("id", sql.Int, user.id)
      .query(`UPDATE Users SET last_login = GETDATE() WHERE id = @id`);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function profile(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, req.user.id)
      .query(
        "SELECT id, name, email, role, created_at, last_login FROM Users WHERE id = @id",
      );

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "user not found" });

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.export = { register, login, profile };
