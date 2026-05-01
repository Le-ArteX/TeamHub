const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const { initSocket } = require('./lib/socket');

const app = express();
const server = http.createServer(app);


initSocket(server);


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url}`);
  next();
});


app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Collaborative Team Hub API is running' });
});


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/workspaces', require('./routes/workspace.routes'));
app.use('/api/workspaces/:workspaceId/goals', require('./routes/goals.routes'));
app.use('/api/workspaces/:workspaceId/announcements', require('./routes/announcements.routes'));
app.use('/api/workspaces/:workspaceId/actions', require('./routes/actions.routes'));
app.use('/api/workspaces/:workspaceId/analytics', require('./routes/analytics.routes'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
