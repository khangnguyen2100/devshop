import app from 'src/app';
import configEnv from 'src/configs/config.env';

import instanceDb from './configs/db';

app.listen(configEnv.port, () => {
  console.log(`🚀 ${configEnv.name} ${configEnv.version} 🚀`);
  console.log(
    `🚀 Listening on ${configEnv.port} with NODE_ENV=${configEnv.nodeEnv} 🚀`,
  );
});
process.on('exit', () => {
  console.log('Process exit');
  instanceDb.close();
});
