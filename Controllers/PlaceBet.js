// Database connection configuration
const mysql = require("mysql2/promise");

const dbConfig = {
  host: "stage-db-1.cmhfjy9fvag5.ap-south-1.rds.amazonaws.com",
  user: "admin",
  database: "oscardb",
  password: "YNLx5TMezvpXZmS",
};

const placeBet = async (req, res) => {
  const {
    userId,
    token,
    operatorId,
    currency,
    amount,
    roundId,
    request_uuid,
    bet_id,
    bet_time,
    game_id,
    game_code,
  } = req.body;

  try {
    // Create a MySQL connection
    const connection = await mysql.createConnection(dbConfig);

    // Start a transaction
    await connection.beginTransaction();

    try {
      // Check if the user with the given userId and token exists
      const [userResult] = await connection.execute(
        "SELECT LimitCurr FROM clientInfo where token = ?",
        [token]
      );

      if (userResult.length === 0) {
        return res
          .status(404)
          .json({ error: "User not found or invalid credentials" });
      }
      console.log(userResult);
      const currentBalance = userResult[0].LimitCurr;
      console.log(currentBalance);

      // Check if the user has enough balance to place the bet
      if (currentBalance < amount) {
        return res
          .status(400)
          .json({ error: "Insufficient balance to place the bet" });
      }

      // Deduct the bet amount from the user's balance
      const newBalance = currentBalance - amount;
      console.log(amount);
      console.log(newBalance);
      await connection.execute(
        "UPDATE clientInfo SET LimitCurr = ? WHERE  token = ?",
        [newBalance, token]
      );

      // Insert the updated record into the newly created table
      const [betResult] = await connection.execute(
        "INSERT INTO CrashjetBet (BetStatus,Sport,ClientId,updated_on,updated_by,User_Id, token,Amount,roundId,Operator_Id,Currency,Request_UUID,Bet_Id,Bet_Time,GameId, GameCode,Transaction_Type) VALUES (DEFAULT,DEFAULT,0,DEFAULT,DEFAULT,?, ?, ?, ?, ?, ?,?,?,?,?,?,DEFAULT)",
        [
          userId,
          token,
          amount,
          roundId,
          operatorId,
          currency,
          request_uuid,
          bet_id,
          bet_time,
          game_id,
          game_code,
        ]
      );

      // Commit the transaction
      await connection.commit();

      res.json({ success: true, balance: newBalance, bet: betResult });
    } catch (error) {
      // Rollback the transaction in case of an error
      await connection.rollback();
      console.error("Error placing bet:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      // Close the connection when done
      connection.end();
    }
  } catch (error) {
    console.error("Error connecting to the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { placeBet };