const {getPool, sql} = require("../config/db");

async function logActivity(userId, action, description = "", ip=""){
    try{
        const pool = await getPool();
        await pool.request()
            .input("user_id", sql.Int, userId)
            .input("action", sql.NVarChar, action)
            .input ("description",sql.NVarChar, ip)
            .query(`INSERT INTO ActivityLogs (user_id, action, decription, ip_address)
                VALUES (@user_id, @action, @description, @ip_address)`);
    } catch(err){
        console.log("Activity Logs Error:",err.message);
    }
}