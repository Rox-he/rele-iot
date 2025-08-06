const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Estado del relé
let estadoRele = "OFF";

// Estado del ángulo del servo
let anguloServo = 90;

// === Rele ===
app.get('/api/iot/estado', (req, res) => {
  res.json({ estado: estadoRele });
});

app.post('/api/iot/estado', (req, res) => {
  const { estado } = req.body;
  if (estado === "ON" || estado === "OFF") {
    estadoRele = estado;
    res.json({ mensaje: `Estado cambiado a ${estadoRele}` });
  } else {
    res.status(400).json({ error: "Estado inválido (usa ON u OFF)" });
  }
});

// === Servomotor ===
app.get('/api/iot/angulo', (req, res) => {
  res.json({ angulo: anguloServo });
});

app.post('/api/iot/angulo', (req, res) => {
  const { angulo } = req.body;
  if (!isNaN(angulo) && angulo >= 0 && angulo <= 180) {
    anguloServo = angulo;
    res.json({ mensaje: `Ángulo actualizado a ${anguloServo}` });
  } else {
    res.status(400).json({ error: "Ángulo inválido (0-180)" });
  }
});

app.listen(port, () => {
  console.log(`Servidor API en http://localhost:${port}`);
});
