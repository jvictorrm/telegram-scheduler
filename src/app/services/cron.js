import moment from "moment";
import { CronJob } from "cron";
import UserController from "../controllers/User";

export default function (ctx, date, message) {
  try {
    const currentDate = moment.tz(moment(), process.env.TIMEZONE);
    const cronDate = moment
      .tz(date, process.env.TIMEZONE)
      .subtract(process.env.SIGNAL_MINUTES, "minutes");

    if (!cronDate.isAfter(currentDate)) {
      return;
    }

    return new CronJob(
      cronDate,
      async function () {
        const users = await UserController.getAll({ isLoggedIn: true });
        const telegramUserIds = users.map((user) => user.telegramUserId);
        telegramUserIds.map((telegramUserId) => {
          ctx.telegram.sendMessage(telegramUserId, message);
        });
      },
      null,
      true,
      process.env.TIMEZONE
    );
  } catch (error) {
    throw new Error(error.message);
  }
}
