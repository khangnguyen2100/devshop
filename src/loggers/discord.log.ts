import discord from 'discord.js';
import configEnv from 'src/configs/config.env';
import type { TextChannel } from 'discord.js';
const { Client, GatewayIntentBits } = discord;

class LoggerService {
  client: discord.Client;
  generalChanelId: string;
  apiRequestLogChannelId: string;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    // login
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);
    });
    this.client.login(configEnv.discordBotToken);

    // set chanel id
    this.generalChanelId = configEnv.discordGeneralLogChannelId;
    this.apiRequestLogChannelId = configEnv.discordApiRequestLogChannelId;
  }
  getChanel(chanelId: string) {
    const chanel = this.client.channels.cache.get(chanelId) as TextChannel;
    if (!chanel) {
      throw new Error('Channel not found: ' + chanelId);
    }
    return chanel;
  }
  sendTextMessage(chanelId: string, message: string) {
    const chanel = this.getChanel(chanelId);
    chanel.send(message).catch(error => {
      console.error('Message not sent: ', error);
    });
  }
  sendEmbedMessage(
    chanelId: string,
    data: { title: string; message: string; code?: any },
  ) {
    const { title = '', message = '', code } = data;
    const codeMessage = {
      content: message,
      embeds: [
        {
          color: parseInt('00ff00', 16),
          title,
          description: '```json\n' + JSON.stringify(code, null, 2) + '\n```',
        },
      ],
    };
    const chanel = this.getChanel(chanelId);
    chanel.send(codeMessage).catch(error => {
      console.error('Message not sent: ', error);
    });
  }
}
const loggerService = new LoggerService();

export default loggerService;
