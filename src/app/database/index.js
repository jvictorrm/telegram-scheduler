import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
import PouchDBDebug from "pouchdb-debug";

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (process.env.NODE_ENV === "development") {
      PouchDB.plugin(PouchDBDebug);
      //PouchDB.debug.enable("*");
    }

    PouchDB.plugin(PouchDBFind);
    this.db = new PouchDB("dbscheduler");
  }
}

export default new Database().db;
