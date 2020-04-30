import util from "util";
import startTemplate from "../templates/start";
import WizardScene from "telegraf/scenes/wizard";
import Markup from "telegraf/markup";
import UserController from "../controllers/User";

const startScene = new WizardScene(
  "start-scene",
  (ctx) => {
    ctx.reply(
      util.format(startTemplate, ctx.chat.first_name),
      Markup.inlineKeyboard([
        Markup.callbackButton("✅ Sim", "yes"),
        Markup.callbackButton("❌ Não", "no"),
      ]).extra()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    const { callback_query } = ctx.update;

    if (!callback_query) {
      ctx.reply("Resposta inválida 🚫");
      return ctx.scene.leave();
    }

    const isAdmin = callback_query.data === "yes" ? true : false;
    ctx.wizard.state.isAdmin = isAdmin;

    if (isAdmin) {
      ctx.reply("Informe a chave de Administrador 🔑");
      return ctx.wizard.next();
    }

    return ctx.wizard.steps[2](ctx);
  },
  async (ctx) => {
    if (ctx.scene.state.isAdmin) {
      if (process.env.ADMIN_KEY !== ctx.update.message.text) {
        ctx.reply("Chave inválida 🚫");
        return ctx.scene.leave();
      }
    }

    // save user
    const { id } = await ctx.getChat(),
      isAdmin = ctx.scene.state.isAdmin,
      isLoggedIn = true;

    try {
      await UserController.storeOrUpdate({
        telegramUserId: id,
        isAdmin,
        isLoggedIn,
      });
      ctx.reply(
        "Login efetuado com sucesso! ❇️\n\nQualquer dúvida utilize o comando /help"
      );
    } catch (error) {
      ctx.reply(error.message);
    } finally {
      return ctx.scene.leave();
    }
  }
);

export default startScene;
