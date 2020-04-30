import User from "../schemas/User";

class UserController {
  async getAll(objWhere) {
    try {
      return await User.find(objWhere);
    } catch (error) {
      throw new Error(`Erro ao buscar Usuários: ${error.message}`);
    }
  }

  async getByTelegramUserId(telegramUserId) {
    try {
      return await User.findOne({ telegramUserId });
    } catch (error) {
      throw new Error(`Erro ao buscar Usuário: ${error.message}`);
    }
  }

  async storeOrUpdate(user) {
    try {
      const userFound = await this.getByTelegramUserId(user.telegramUserId);
      if (userFound) {
        const { _id, _rev } = userFound;
        await User.update({ _id, _rev }, user);
        return true;
      }

      const { id } = await User.insert(user);
      return true;
    } catch (error) {
      throw new Error(`Erro ao efetuar login: ${error.message}`);
    }
  }
}

export default new UserController();
