const sql = require('mssql')

const connectDB = async () => {
   return await sql.connect('Server=192.168.13.22,1433;Database=PHANTICH;User Id=THANHMINH;Password=123beta456;Encrypt=false;Request Timeout=30000');
}

export default connectDB;
