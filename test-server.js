import express from 'express';

const app = express();
const PORT = 3001;

app.get('/test', (req, res) => {
  res.json({ message: 'Test Server is working!' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Test Server → http://127.0.0.1:${PORT}`);
});
