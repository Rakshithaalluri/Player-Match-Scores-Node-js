const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(2375, () => {
      console.log("Server running at http://localhost:2375/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName
    FROM player_details`;

  const dbPlayerResponse = await db.all(getPlayerQuery);
  response.send(dbPlayerResponse);
});

//api2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerSingleQuery = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName
    FROM player_details
    WHERE player_id = ${playerId}`;

  const dbPlayerSingleResponse = await db.get(getPlayerSingleQuery);
  response.send(dbPlayerSingleResponse);
});

//api3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const updatePlayerDetails = `
    UPDATE 
    player_details 
    SET player_name = '${playerName}'
    WHERE player_id = ${playerId};
    `;
  const dbUpdateResponse = await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//api4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerSingleQuery = `
    SELECT 
    match_id AS matchId,
    match AS match,
    year AS year
    FROM match_details
    WHERE match_id = ${matchId}`;

  const dbMatchSingleResponse = await db.get(getPlayerSingleQuery);
  response.send(dbMatchSingleResponse);
});

//api 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerSingleQuery = `
    SELECT 
    match_id AS matchId,
    match AS match,
    year AS year
    FROM 
    player_match_score NATURAL JOIN match_details
    WHERE player_id = ${playerId}`;

  const dbMatchSingleResponse = await db.all(getPlayerSingleQuery);
  response.send(dbMatchSingleResponse);
});

//api6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerSingleQuery = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName 
    FROM 
    player_details NATURAL JOIN  player_match_score
    WHERE match_id = ${matchId}`;

  const dbMatchSingleResponse = await db.all(getPlayerSingleQuery);
  response.send(dbMatchSingleResponse);
});

//api 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerSingleQuery = `
    SELECT 
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(player_match_score.fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM 
    player_details INNER JOIN  player_match_score 
    ON 
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId}`;

  const dbMatchSingleResponse = await db.get(getPlayerSingleQuery);
  response.send(dbMatchSingleResponse);
});

module.exports = app;
