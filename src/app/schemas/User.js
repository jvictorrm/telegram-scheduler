import database from "../database";

class User {
  async findById(id) {
    return await database.get(id);
  }

  async findOne(objWhere) {
    const respFindOne = await database.find({
      selector: objWhere,
      limit: 1,
    });

    return !respFindOne.docs || respFindOne.docs[0];
  }

  async find(objWhere) {
    if (!objWhere) {
      const respFind = await database.allDocs({
        include_docs: true,
        limit: 15,
      });

      return respFind.rows.map((row) => {
        return row.doc;
      });
    } else {
      const respFindOne = await database.find({
        selector: objWhere,
      });

      return respFindOne.docs;
    }
  }

  async insert(objInsert) {
    const respInsert = await database.post(objInsert);
    if (!respInsert.ok) {
      throw new Error("Erro ao cadastrar usuário");
    }

    return respInsert.id;
  }

  async update(objectWhere, objectUpdate) {
    const respUpdate = await database.put({ ...objectWhere, ...objectUpdate });
    if (!respUpdate.ok) {
      throw new Error("Erro ao atualizar usuário");
    }

    return respUpdate.id;
  }
}

export default new User();
