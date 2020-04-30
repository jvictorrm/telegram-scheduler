import moment from "moment";
import Markup from "telegraf/markup";
import WizardScene from "telegraf/scenes/wizard";
import regexHelper from "../helpers/regex";
import CronManagerController from "../controllers/CronManager";
import UserController from "../controllers/User";
import cronService from "../services/cron";
import signalsListTemplate from "../templates/signalsList";

export default new WizardScene(
  "scheduler-scene",
  async (ctx) => {
    const { id } = await ctx.getChat();
    const user = await UserController.getByTelegramUserId(id);

    if (!user.isLoggedIn) {
      ctx.replyWithMarkdown(
        "Você ainda não efetuou o login 😕\n\nDigite /start para logar e continuar com o agendamento"
      );
      return ctx.scene.leave();
    }

    // only admin
    if (!user.isAdmin) {
      ctx.replyWithMarkdown(
        "Agendamento de sinais devem ser feitos somente por Administradores 🚫"
      );
      return ctx.scene.leave();
    }

    // range between (23:45 - 00:15)
    const currentTime = moment.tz(moment(), process.env.TIMEZONE);
    const limitTimeStart = moment.tz(
      moment(process.env.SCHEDULER_LIMIT_TIME_START, "HH:mm"),
      process.env.TIMEZONE
    );
    const limitTimeEnd = moment.tz(
      moment(process.env.SCHEDULER_LIMIT_TIME_START, "HH:mm"),
      process.env.TIMEZONE
    );

    if (
      !(
        currentTime.isSameOrAfter(limitTimeStart) ||
        currentTime.isSameOrBefore(limitTimeEnd)
      )
    ) {
      ctx.reply(
        `Novos agendamentos não são permitidos entre os horários ${process.env.SCHEDULER_LIMIT_TIME_START} e ${process.env.SCHEDULER_LIMIT_TIME_END} 🚫`
      );
      return ctx.scene.leave();
    }

    // get new job list
    if (CronManagerController.getJobs().length <= 0) {
      ctx.replyWithMarkdown(signalsListTemplate);
      return ctx.wizard.next();
    }

    // reschedule
    return ctx.wizard.steps[2](ctx);
  },
  async (ctx) => {
    let signals = [],
      date = "";

    try {
      var typeSignal = "";
      await Promise.all(
        ctx.message.text.split("\n").map((line) => {
          try {
            const lineDateRegex = line.match(regexHelper.date);
            if (lineDateRegex) date = lineDateRegex[3];
          } catch (error) {
            throw new Error("Formato linha DATA inválido");
          }

          try {
            const lineTypeSignalRegex = line.match(regexHelper.typeSignal);
            if (typeSignalRegex) {
              typeSignal = `${lineTypeSignalRegex[3]}${lineTypeSignalRegex[4]}`;
            }

            const lineSignalRegex = line.match(regexHelper.signal);
            if (lineSignalRegex)
              signals.push({
                typeSignal,
                signal: lineSignalRegex[2],
                text: lineSignalRegex[4],
                time: lineSignalRegex[6],
              });
          } catch (error) {
            throw new Error("Formato linha SINAL inválido");
          }
        })
      );

      if (date === "" || signals.length <= 0) {
        ctx.reply("Data e/ou sinais não encontrados para serem agendados 🚫");
        return ctx.scene.leave();
      }

      await Promise.all(
        signals.map((obj) => {
          const cronDate = moment.tz(
            moment(`${date} ${obj.time}`, "DD/MM/YYYY HH:mm"),
            process.env.TIMEZONE
          );

          const message =
            `${obj.typeSignal}: Sinal ${obj.signal} para ${obj.text} ` +
            `daqui a ${process.env.SIGNAL_MINUTES} minutos. Às ${obj.time} 📟`;

          const job = cronService(ctx, cronDate, message);

          if (job) {
            CronManagerController.addJob(job);
          }
        })
      );

      const scheduledJobsLength = CronManagerController.getJobs().length;
      ctx.replyWithMarkdown(
        `*${scheduledJobsLength}* sinal(is) agendado(s) de *${signals.length}* ⏰`
      );
    } catch (error) {
      ctx.reply(`Erro: ${error.message}`);
    } finally {
      return ctx.scene.leave();
    }
  },
  (ctx) => {
    ctx.reply(
      "Você deseja reagendar os sinais?",
      Markup.inlineKeyboard([
        Markup.callbackButton("✅ Sim", "yes"),
        Markup.callbackButton("❌ Não", "no"),
      ]).extra()
    );
    return ctx.wizard.selectStep(3);
  },
  (ctx) => {
    const { callback_query } = ctx.update;

    if (!callback_query) {
      ctx.reply("Resposta inválida 🚫");
      return ctx.scene.leave();
    }

    const reschedule = callback_query.data === "yes" ? true : false;

    if (!reschedule) {
      ctx.reply("Agendamento de sinais mantido ⏰");
      return ctx.scene.leave();
    }

    CronManagerController.stopJobs();
    ctx.replyWithMarkdown(signalsListTemplate);
    return ctx.wizard.selectStep(1);
  }
);
