const jwt = require(jsonwebtoken);

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });
//Bearer eyJhbGciOiJIUzI1NiIs..."
  const token = authHeader.split(" ")[1];
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }catch(err){
    return res.status(401).json({message:"Invalid or expired token"})
  }
}


function adminMiddleware(req, res, next){
    if(req.user.role !== "admin"){
      return res.status(403).json({message:"Access denied, admin access required"});
}
}
module.exports = { authMiddleware, adminMiddleware };