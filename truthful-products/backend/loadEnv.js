const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const runtimeEnvPath = path.resolve(__dirname, 'env.runtime');

if (fs.existsSync(runtimeEnvPath)) {
  dotenv.config({ path: runtimeEnvPath });
} else {
  dotenv.config();
}
