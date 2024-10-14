import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "OnePaulrus2Many",
  port: 5432,
});
db.connect();

let visitedCountries = [];

async function CheckVisitedCountries() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries"
  );
  let visitedCountries = result.rows.map((x) => x["country_code"]);
  return visitedCountries;
}
// db.end();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  //Write your code here.

  visitedCountries = await CheckVisitedCountries();

  res.render("index.ejs", {
    countries: visitedCountries,
    total: visitedCountries.length
  })
});

app.post("/add", async (req, res) => {

  // query from the input from the form (using lower case to making it always match)
  const findCountry = await db.query(`SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';`, [req.body.country.toLowerCase()]);

  // check to see if there is a match with a country
  if(findCountry.rows.length === 0){
    res.render("index.ejs", {
      countries: visitedCountries,
      total: visitedCountries.length,
      error: "Sorry, that is not a valid country."
    })
    return;
  }

  const searchedCountry = findCountry.rows[0]["country_code"];

  // check to see if it's in the database
  if(!visitedCountries.includes(searchedCountry)){
    // add to the database
    const addToDatabase = await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [searchedCountry]);
  }else{
    res.render("index.ejs", {
      countries: visitedCountries,
      total: visitedCountries.length,
      error: "Sorry, that country was already added."
    })
    return;
  }

  // redirect back to the map page
  res.redirect("/");
})

// const capitilizeWord = (word) => {
//   return word[0].toUpperCase() + word.slice(1);
// };


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

