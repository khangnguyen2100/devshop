import app from 'src/app';
import config from 'src/config';

app.listen(config.port, () => {
  console.log(`🚀 ${config.name} ${config.version} 🚀`);
  console.log(
    `🚀 Listening on ${config.port} with NODE_ENV=${config.nodeEnv} 🚀`,
  );
});
