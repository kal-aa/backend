import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
app.use(cors());
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not set in the environment variables.");
  process.exit(1); // stop the server
}

app.get("/currentWeather", async (req, res) => {
  const city = req.query.city;
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const {
      main: { temp, feels_like },
      weather,
    } = response.data;
    const description = weather[0].description;
    const icon = weather[0].icon;
    res.json({ temperature: temp, feels_like, description, icon });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: "City not found" });
    } else {
      console.error("Error fetching weather data:", error.message);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  }
});

app.get("/forecast", async (req, res) => {
  const city = req.query.city;
  const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const forecast = response.data.list.map((item) => ({
      date: item.dt_txt,
      temperature: item.main.temp,
      feels_like: item.main.feels_like,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
    }));
    res.json(forecast);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: "City not found" });
    } else {
      console.error("Error fetching weather data:", error.message);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  }
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log("You're listening to port", port);
});
