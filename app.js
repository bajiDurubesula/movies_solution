const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const intialization = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
  }
};
intialization();

const movieCaseConversion = (movie) => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
};

const directorCaseConversion = (director) => {
  return {
    directorId: director.director_id,
    directorName: director.director_name,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const movieName = `SELECT movie_name FROM movie`;
  const moviesList = await db.all(movieName);
  response.send(moviesList.map((each) => movieCaseConversion(each)));
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovie = `
    INSERT INTO 
    movie (director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}')
    `;
  await db.run(addMovie);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const specificMovie = `SELECT * FROM movie WHERE movie_id= ${movieId}`;
  const movieRecognized = await db.get(specificMovie);
  response.send(movieCaseConversion(movieRecognized));
});

//API 4
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieUpdate = `
    UPDATE
      movie
    SET 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    `;
  await db.run(movieUpdate);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `DELETE FROM movie WHERE movie_id =${movieId}`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const directors = `SELECT * FROM director`;
  const directorsList = await db.all(directors);
  response.send(directorsList.map((each) => directorCaseConversion(each)));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const movieNames = `
  SELECT 
    movie.movie_name AS movieName 
  FROM 
    director JOIN movie 
  WHERE 
    director.director_id= ${directorId}`;
  const directorMovies = await db.all(movieNames);
  response.send(directorMovies);
});

module.exports = app;
