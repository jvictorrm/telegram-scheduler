import helpTemplate from "../templates/help";
import UserController from "../controllers/User";

export default async (ctx) => {
  const { id } = await ctx.getChat();
  const user = await UserController.getByTelegramUserId(id);

  if (!user || !user.isLoggedIn) {
    return ctx.replyWithMarkdown(
      `Para eu te mostrar as opções, preciso saber qual é o seu perfil. 😕\n${ctx.chat.first_name}, efetue o *login* digitando /start`
    );
  }

  ctx.replyWithMarkdown(helpTemplate[user.isAdmin ? "admin" : "user"]);
};
