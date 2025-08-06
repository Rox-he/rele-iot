const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // o aquí coloca tu dominio si quieres limitar acceso
  }
});

// Estado del relé
let estadoRele = "OFF";

// Estado del ángulo del servo
let anguloServo = 90;

// Cuando un cliente se conecta
io.on('connection', (socket) => {
  console.log('Cliente conectado', socket.id);

  // Envía el estado inicial al conectar
  socket.emit('estadoRele', estadoRele);
  socket.emit('anguloServo', anguloServo);

  // Recibe cambio de ángulo desde cliente (opcional si quieres permitirlo)
  socket.on('cambiarAngulo', (nuevoAngulo) => {
    if (!isNaN(nuevoAngulo) && nuevoAngulo >= 0 && nuevoAngulo <= 180) {
      anguloServo = nuevoAngulo;
      // Emitir a todos los clientes
      io.emit('anguloServo', anguloServo);
    }
  });

  // Recibe cambio de rele desde cliente
  socket.on('cambiarEstadoRele', (nuevoEstado) => {
    if (nuevoEstado === 'ON' || nuevoEstado === 'OFF') {
      estadoRele = nuevoEstado;
      io.emit('estadoRele', estadoRele);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado', socket.id);
  });
});

// === Rele ===
app.get('/api/iot/estado', (req, res) => {
  res.json({ estado: estadoRele });
});

app.post('/api/iot/estado', (req, res) => {
  const { estado } = req.body;
  if (estado === "ON" || estado === "OFF") {
    estadoRele = estado;
    // Notifica a todos los clientes conectados
    io.emit('estadoRele', estadoRele);
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
    // Notifica a todos los clientes conectados
    io.emit('anguloServo', anguloServo);
    res.json({ mensaje: `Ángulo actualizado a ${anguloServo}` });
  } else {
    res.status(400).json({ error: "Ángulo inválido (0-180)" });
  }
});

server.listen(port, () => {
  console.log(`Servidor API + WebSocket en http://localhost:${port}`);
});
