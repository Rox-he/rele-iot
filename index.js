const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // para leer JSON en POST

// Variable para guardar el estado del relé
let estadoRele = "OFF";

// Endpoint que el ESP32 consulta
app.get('/api/iot/estado', (req, res) => {
  res.json({ estado: estadoRele });
});

// Endpoint que la web usa para cambiar el estado
app.post('/api/iot/estado', (req, res) => {
  const { estado } = req.body;
  if (estado === "ON" || estado === "OFF") {
    estadoRele = estado;
    res.json({ mensaje: `Estado cambiado a ${estadoRele}` });
  } else {
    res.status(400).json({ error: "Estado inválido (usa ON u OFF)" });
  }
});

app.listen(port, () => {
  console.log(`Servidor API en http://localhost:${port}`);
});
