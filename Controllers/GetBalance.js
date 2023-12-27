const { fetchBalance } = require("../Utils/Utils");

let connection = null;

const getBalance = async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "RS_ERR",
      balance: 0,
    });
  }

  try {
    // Use the fetchBalance function to get the balance
    const balance = await fetchBalance(userId, token);

    if (balance === null) {
      return res.status(404).json({
        success: false,
        error: "User not found or invalid credentials",
        message: "RS_ERR",
      });
    }

    console.log("Success");
    res.json({ success: true, balance: balance, message: "RS_OK" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "RS_ERR",
      balance: 0,
    });
  } finally {
    // Release the connection when done
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = { getBalance };
