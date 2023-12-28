import app from 'src/app';
import configEnv from 'src/configs/config.env';

app.listen(configEnv.port, () => {
  console.log(`🚀 ${configEnv.name} ${configEnv.version} 🚀`);
  console.log(
    `🚀 Listening on ${configEnv.port} with NODE_ENV=${configEnv.nodeEnv} 🚀`,
  );
});
