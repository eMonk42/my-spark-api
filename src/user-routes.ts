import { checkIfToken, getAuthentication } from "./auth";
import { db } from "./db";

export function userRoutes(fastify, options, done) {
  //--------------------------------USERS------------------------------------------
  // GET USER
  fastify.get("/users/:userid", async (request, reply) => {
    const jwt = request.headers.authorization;
    checkIfToken(jwt, reply);
    const res = await getAuthentication(jwt, reply);
    if (res) {
      try {
        const userid = (request.params as any).userid;
        const res = await db.query("select * from users where userid = $1", [
          userid,
        ]);
        if (res.rows[0]) {
          reply.header("Access-Control-Allow-Origin", "*");
          return res.rows;
        } else {
          const res2 = await db.query(
            "insert into users values(default, '001', 'name yourself here', $1) returning *",
            [userid]
          );
          const res3 = await db.query(
            "insert into tags values(default, 'Personal') returning *"
          );
          await db.query("insert into tags_users values($1, $2)", [
            res3.rows[0].tag_id,
            res2.rows[0].id,
          ]);
          const res4 = await db.query(
            "insert into tags values(default, 'Todo') returning *"
          );
          await db.query("insert into tags_users values($1, $2)", [
            res4.rows[0].tag_id,
            res2.rows[0].id,
          ]);
          return { msg: "new user created", user: res2.rows[0] };
        }
      } catch (err) {
        return err.message;
      }
    }
  });

  // UPDATE USER
  fastify.patch("/users", async (request, reply) => {
    const jwt = request.headers.authorization;
    checkIfToken(jwt, reply);
    const res = await getAuthentication(jwt, reply);
    if (res) {
      try {
        const { id, nickname, profilepic } = request.body as any;
        const res = await db.query(
          "update users set nickname = $1, profilepic = $2 where id = $3 returning *",
          [nickname, profilepic, id]
        );
        return res.rows[0];
      } catch (err) {
        console.log(err.message);
      }
    }
  });
  done();
}
