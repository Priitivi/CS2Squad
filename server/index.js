// server/index.js
const app = require('./appInstance');

const port = process.env.PORT || 5000;

// bind 0.0.0.0 so Docker can reach it
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${port}`);
});
