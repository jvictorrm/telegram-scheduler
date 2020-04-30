import UserController from "../controllers/User";

export default async (ctx) => {
  try {
    const { id } = await ctx.getChat();
    const user = await UserController.getByTelegramUserId(id);

    if (!user.isLoggedIn) {
      return ctx.reply(
        "Você ainda não efetuou o login 😕\n\nDigite /start para logar"
      );
    }

    user.isLoggedIn = false;
    await UserController.storeOrUpdate(user);
    ctx.reply(`Logout efetuado com sucesso! ❇️`);
  } catch (error) {
    ctx.reply(`Erro ao realizar logout: ${error.message}`);
  }
};
