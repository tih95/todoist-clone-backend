const config = require('./config');
const app = require('./app');

app.listen(config.PORT, '0.0.0.0', () => {
  console.log(`Server listening on PORT ${config.PORT}`);
});