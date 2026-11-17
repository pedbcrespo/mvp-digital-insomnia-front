const API_URL = "http://127.0.0.1:5000/digital-insomnia/predict";
const form = document.getElementById("sleep-form");
const button = document.getElementById("submit-button");
const result = document.getElementById("result");
const resultLabel = document.getElementById("result-label");
const resultValue = document.getElementById("result-value");
const resultDetail = document.getElementById("result-detail");

function decimalHour(value) {
  const parts = value.split(":").map(Number);
  return parts[0] + parts[1] / 60;
}
function numberValue(data, name) { return Number(data.get(name)); }
function showError(message) {
  result.classList.add("visible", "error");
  resultLabel.textContent = "Não foi possível obter a previsão";
  resultValue.textContent = message;
  resultDetail.textContent = "Confira se a API está em execução e tente novamente.";
}

form.addEventListener("submit", async function(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const payload = {
    age: numberValue(data, "age"),
    gender: data.get("gender"),
    chronotype: data.get("chronotype"),
    occupation: data.get("occupation"),
    bedtime_hour: decimalHour(data.get("bedtime_hour")),
    screen_time_before_bed_min: numberValue(data, "screen_time_before_bed_min"),
    primary_app_category: data.get("primary_app_category"),
    screen_brightness_pct: numberValue(data, "screen_brightness_pct"),
    blue_light_filter_on: data.get("blue_light_filter_on") === "true",
    caffeine_intake_mg: numberValue(data, "caffeine_intake_mg"),
    caffeine_last_hour: decimalHour(data.get("caffeine_last_hour")),
    physical_activity_min: numberValue(data, "physical_activity_min"),
    room_temperature_f: numberValue(data, "room_temperature_f"),
    ambient_noise_db: numberValue(data, "ambient_noise_db")
  };

  button.disabled = true;
  button.textContent = "Consultando modelo...";
  result.classList.remove("visible", "error");
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(function() { return {}; });
    if (!response.ok) {
      throw new Error(body.message || body.error || ("Erro HTTP " + response.status));
    }
    if (!body.prediction) throw new Error("A resposta da API não contém a previsão esperada.");
    result.classList.add("visible");
    resultLabel.textContent = "Categoria estimada";
    resultValue.textContent = body.prediction;
    resultDetail.textContent = "Resultado gerado pelo classificador do MVP.";
  } catch (error) {
    showError(error.message || "Falha de comunicação com a API.");
  } finally {
    button.disabled = false;
    button.textContent = "Estimar categoria";
  }
});
