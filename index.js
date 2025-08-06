const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Importa la conexión a Firebase
const db = require('./firebaseconfig');

// Estado local del servo (sin Firebase)
let anguloServo = 90;

// Rutas para el relé (usa Firebase)
app.get('/api/iot/estado', async (req, res) => {
  try {
    const snapshot = await db.ref('estadoRele').once('value');
    const estado = snapshot.val() || "OFF";
    res.json({ estado });
  } catch (error) {
    res.status(500).json({ error: 'Error al leer desde Firebase' });
  }
});

app.post('/api/iot/estado', async (req, res) => {
  const { estado } = req.body;
  if (estado === "ON" || estado === "OFF") {
    try {
      await db.ref('estadoRele').set(estado);
      res.json({ mensaje: `Estado cambiado a ${estado}` });
    } catch (error) {
      res.status(500).json({ error: 'Error al escribir en Firebase' });
    }
  } else {
    res.status(400).json({ error: 'Estado inválido (usa ON u OFF)' });
  }
});

// Rutas para servo (local, sin Firebase)
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
  console.log(`Servidor API corriendo en http://localhost:${port}`);
});
