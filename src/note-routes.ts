//const auth = require("./auth");
import { checkIfToken, getAuthentication } from "./auth";
import { db } from "./db";

export function noteRoutes(fastify, options, done) {
  //----------------------------NOTES-----------------------------------
  interface UpdateNoteDto {
    title?: string;
    content?: string;
    createdby?: number;
    createdat?: string;
    updatedat?: string;
    collection?: number;
  }

  // READ ALL
  fastify.get("/notes", async (request, reply) => {
    const jwt = request.headers.authorization;
    checkIfToken(jwt, reply);
    const res = await getAuthentication(jwt, reply);
    if (res) {
      try {
        const res2 = await db.query(
          "select notes.id, notes.title, notes.content, notes.createdby, notes.collection, notes.createdat, notes.updatedat from notes join users on users.id = notes.createdby where users.userid = $1 order by createdat asc",
          [res.response.jwt.sub]
        );
        return res2.rows;
      } catch (err) {
        return err.message;
      }
    }
  });

  // READ SINGLE
  fastify.get("/notes/:id", async (request, reply) => {
    const jwt = request.headers.authorization;
    checkIfToken(jwt, reply);
    const res = await getAuthentication(jwt, reply);
    if (res) {
      try {
        const arr = request.url.split("/");
        const res = await db.query("select * from notes where id = $1", [
          arr[arr.length - 1],
        ]);
        if (res.rows[0]) {
          reply.header("Access-Control-Allow-Origin", "*");
          return res.rows;
        } else {
          return "A note with the given ID does not exist";
        }
      } catch (err) {
        return err.message;
      }
    }
  });

  // UPDATE NOTE
  fastify.patch("/notes/:id", async (request, reply) => {
    const jwt = request.headers.authorization;
    checkIfToken(jwt, reply);
    const res = await getAuthentication(jwt, reply);
    if (res) {
      try {
        const { title, content, updatedat, collection } =
          request.body as UpdateNoteDto;
        if (title == "") return "The title can't be empty!";
        const arr = request.url.split("/");
        const res = await db.query(
          "update notes set title = $1, content = $2, updatedat = $3, collection = $4 where id = $5 returning *",
          [title, content, updatedat, collection, arr[arr.length - 1]]
        );
        if (res.rows[0]) {
          reply.header("Access-Control-Allow-Origin", "*");
          return res.rows;
        } else {
          return "A note with the given ID does not exist";
        }
      } catch (err) {
        reply.status(301);
        return { error: err.message };
      }
    }
  });

  // CREATE NOTE
  fastify.post("/notes", async (request, reply) => {
    const jwt = request.headers.authorization;
    checkIfToken(jwt, reply);
    const res = await getAuthentication(jwt, reply);
    if (res) {
      //return "You have been authorized successfully!";
      try {
        const { title, content, collection } = request.body as UpdateNoteDto;
        const id = await db.query("select * from users where userid = $1", [
          res.response.jwt.sub,
        ]);
        if (!title) return "There is no title!";
        const now = new Date();
        const res2 = await db.query(
          "insert into notes values(default, $1, $2, $3, $4, $5, $6) returning *",
          [title, content, id.rows[0].id, collection, now, now]
        );
        return res2.rows;
      } catch (err) {
        return err.message;
      }
    }
  });

  // DELETE NOTE
  fastify.delete("/notes/:id", async (request, reply) => {
    const jwt = request.headers.authorization;
    checkIfToken(jwt, reply);
    const res = await getAuthentication(jwt, reply);
    if (res) {
      try {
        const arr = request.url.split("/");
        const res = await db.query(
          "delete from notes where id = $1 returning *",
          [arr[arr.length - 1]]
        );
        if (res.rows[0]) {
          reply.header("Access-Control-Allow-Origin", "*");
          return res.rows;
        } else {
          return "A note with the given ID does not exist";
        }
      } catch (err) {
        return err.message;
      }
    }
  });
  done();
}
