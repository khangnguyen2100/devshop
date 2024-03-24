import { RequestHandler } from 'express';
import configEnv from 'src/configs/config.env';
import loggerService from 'src/loggers/discord.log';

const pushApiLogToChanel: RequestHandler = async (req, res, next) => {
  try {
    // Get data from request
    const data = {} as any;
    if (req.query && Object.keys(req.query).length > 0) {
      data.query = req.query;
    }
    if (req.params && Object.keys(req.params).length > 0) {
      data.params = req.params;
    }
    if (req.body && Object.keys(req.body).length > 0) {
      data.body = req.body;
    }

    // send message
    loggerService.sendEmbedMessage(configEnv.discordApiRequestLogChannelId, {
      title: `Method: ${req.method} - ${res.statusCode}`,
      message: `API: ${req.get('host') + req.originalUrl}`,
      code: {
        data: data,
      },
    });

    return next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const sendOrderLogMessage = (codeMessage: any) => {
  const chanel = loggerService.getChanel(configEnv.discordOrderNotifyChannelId);
  chanel.send(codeMessage).catch(error => {
    console.error('Message not sent: ', error);
  });
};
export { pushApiLogToChanel, sendOrderLogMessage };
