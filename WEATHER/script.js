const apiKey = "2f7ae79417f8425fba1120326251406";

// Main function to get weather
async function getWeather(city = null) {
  const input = document.getElementById("locationInput");
  const location = city || input.value.trim();
  const resultDiv = document.getElementById("result");
  const useFahrenheit = document.getElementById("unitToggle").checked;

  if (!location) {
    resultDiv.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=yes`
    );
    if (!res.ok) throw new Error("Location not found");

    const data = await res.json();
    const {
      name,
      country,
      localtime
    } = data.location;
    const {
      temp_c,
      temp_f,
      condition,
      humidity,
      wind_kph
    } = data.current;

    // Set dynamic theme
    setTheme(condition.text.toLowerCase());

    // Weather icon
    const iconUrl = "https:" + condition.icon;

    let output = `
      <h2>${name}, ${country}</h2>
      <img src="${iconUrl}" alt="${condition.text}" class="weather-icon" />
      <p><strong>Condition:</strong> ${condition.text}</p>
      <p><strong>Temperature:</strong> ${useFahrenheit ? temp_f + "°F" : temp_c + "°C"}</p>
      <p><strong>Humidity:</strong> ${humidity}%</p>
      <p><strong>Wind:</strong> ${wind_kph} km/h</p>
      <p><strong>Local Time:</strong> ${localtime}</p>
      <div class="cloud"></div>
    `;

    resultDiv.innerHTML = output;

    // Save to history
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    if (!history.includes(name)) {
      history.unshift(name);
      if (history.length > 5) history.pop();
      localStorage.setItem("weatherHistory", JSON.stringify(history));
    }
    renderHistory();
  } catch (error) {
    resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

// Detect geolocation and get weather
function getLocationWeather() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        getWeather(`${latitude},${longitude}`);
      },
      (error) => {
        alert("Geolocation failed. Please allow location access or enter manually.");
      }
    );
  } else {
    alert("Geolocation not supported.");
  }
}

// Render past search history
function renderHistory() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  const resultDiv = document.getElementById("result");

  if (history.length > 0) {
    resultDiv.innerHTML += `<hr><h3>Search History:</h3>`;
    resultDiv.innerHTML += history
      .map((city) => `<button onclick="getWeather('${city}')">${city}</button>`)
      .join(" ");
  }
}

// Set background theme based on condition
function setTheme(condition) {
  const body = document.body;
  body.className = ""; // clear old theme

  if (condition.includes("sunny") || condition.includes("clear")) {
    body.classList.add("sunny-theme");
  } else if (condition.includes("cloud")) {
    body.classList.add("cloudy-theme");
  } else if (condition.includes("rain") || condition.includes("drizzle")) {
    body.classList.add("rainy-theme");
  } else if (condition.includes("snow") || condition.includes("ice")) {
    body.classList.add("snowy-theme");
  } else {
    body.classList.add("default-theme");
  }
}

// Load history on startup
window.onload = () => {
  renderHistory();
};
