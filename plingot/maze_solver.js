// Hajar Rashidi (Dept First Search using recursion)
/*
* We have a API service running at https://mazegame.plingot.com/swagger/
Each room has a list of its available exits, given as compass directions (North, South, East and West)
Authentication is very simple. Create a game and use the resulting token in the Authorization header in subsequent requests.
We want you to write a React (or Next) app implementing a user interface for anyone to complete the Maze with. Make buttons for the different directions that are available and if you have time to spare you can also visualize what the maze might look like. The sky is the limit - but keep within the time limit. The main goal is actually not a final product but rather we want to see how you tackle the problem.
Time box it to maximum one hour, don't spend too much time on it. When you're done please put the code in a Zip-file and send It to me.
*/

const BASE_URL = "https://mazegame.plingot.com";
let authToken = null;

const ENDPOINTS = {
  START_GAME: "/Game/start",
  CURRENT_ROOM: "/Room/current",
  MOVE_PLAYER: (direction) => `/Player/move?direction=${direction}`,
};

const makeRequest = async (endpoint, method = "GET", body = null) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: authToken,
    },
    body: body ? JSON.stringify(body) : null,
  });
  return response.json().catch(() => ({}));
};

const startNewGame = async () =>
  (authToken = (
    await makeRequest(ENDPOINTS.START_GAME, "POST", {
      type: "Graph",
      size: 3,
      seed: 0,
    })
  ).token);

const getCurrentRoom = () => makeRequest(ENDPOINTS.CURRENT_ROOM);

const movePlayer = (direction) =>
  makeRequest(ENDPOINTS.MOVE_PLAYER(direction), "PUT");

const findVictoryRoom = async () => {
  const visitedRooms = new Set();
  const backtrack = {
    North: "South",
    South: "North",
    East: "West",
    West: "East",
  };

  const depthFirstSearch = async () => {
    const room = await getCurrentRoom();
    visitedRooms.add(room.id);

    if (room.effect === "Victory") {
      console.log("Player found Exit room!\n Room ID:", room.id);
      return true;
    }

    for (const { direction, destination } of room.paths) {
      if (!visitedRooms.has(destination)) {
        console.log(`Player moved to ${direction}.`);
        await movePlayer(direction);
        if (await depthFirstSearch()) return true;
        await movePlayer(backtrack[direction]);
      }
    }
    return false;
  };

  await depthFirstSearch();
};

const main = async () => {
  try {
    await startNewGame();
    await findVictoryRoom();
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
