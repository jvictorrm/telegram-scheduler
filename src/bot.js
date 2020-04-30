import "dotenv/config";
import "moment-timezone";
import Telegraf from "telegraf";
import session from "telegraf/session";
import Stage from "telegraf/stage";
import SchedulerScene from "./app/scenes/scheduler";
import StartScene from "./app/scenes/start";
import helpCommand from "./app/commands/help";
import logoutCommand from "./app/commands/logout";
import globalCommand from "./app/commands/global";

class Bot {
  constructor() {
    this.init();
    this.middlewares();
    this.commands();

    // global
    this.bot.on("message", async (ctx) => await globalCommand(ctx));
  }

  init() {
    this.bot = new Telegraf(process.env.BOT_TOKEN);
  }

  middlewares() {
    // session
    this.bot.use(session());

    // stages
    this.bot.use(new Stage([StartScene, SchedulerScene]).middleware());
  }

  commands() {
    this.bot.help(async (ctx) => await helpCommand(ctx));
    this.bot.start((ctx) => ctx.scene.enter("start-scene"));
    this.bot.command("agendar", (ctx) => ctx.scene.enter("scheduler-scene"));
    this.bot.command("logout", async (ctx) => await logoutCommand(ctx));
  }
}

export default new Bot().bot;
