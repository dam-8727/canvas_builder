const express = require('express');
const cors = require('cors');
const canvasRoutes = require('./routes/canvas');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/canvas', canvasRoutes);

// Root endpoint 
app.get('/', (req, res) => {
  res.send('Canvas Builder API is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
