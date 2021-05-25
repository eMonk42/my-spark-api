import { checkIfToken, getAuthentication } from "./auth";
import { db } from "./db";

export function tagRoutes(fastify, options, done) {
  //--------------------------------TAGS------------------------------------------

  // GET TAGS FOR USER
  fastify.get("/tags/:userid", async (request, reply) => {
    const jwt = request.headers.authorization;
    checkIfToken(jwt, reply);
    const res = await getAuthentication(jwt, reply);
    if (res) {
      try {
        const userid = (request.params as any).userid;
        const res = await db.query(
          "select tags.tag_id, tags.tag_name from tags_users join tags on tags_users.tag_id=tags.tag_id where tags_users.userid = $1",
          [userid]
        );
        return { tags: res.rows };
      } catch (err) {
        return err.message;
      }
    }
  });

  // UPDATE TAGS
  fastify.post("/tags/:userid", async (request, reply) => {
    const jwt = request.headers.authorization;
    checkIfToken(jwt, reply);
    const res = await getAuthentication(jwt, reply);
    if (res) {
      try {
        const object = {};
        const data = (request.body as any).tagArray;
        for (let tag of data) {
          if (object[tag.tag_name]) {
            reply.status(301);
            return "wait, thats double!";
          } else {
            object[tag.tag_name] = tag.tag_name;
          }
        }
        const userid = (request.params as any).userid;
        if (data.length < 2) return "You must have at least one Tag!";

        const tags = await db.query(
          "select tags.tag_id, tags.tag_name from tags_users join tags on tags_users.tag_id=tags.tag_id where tags_users.userid = $1",
          [userid]
        );

        data.forEach(async (tag) => {
          if (tag.tag_id) {
            for (let i = 0; i < tags.rows.length; i++) {
              if (tags.rows[i].tag_id == tag.tag_id) {
                if (tags.rows[i].tag_name != tag.tag_name) {
                  await db.query(
                    "update tags set tag_name = $1 where tag_id = $2",
                    [tag.tag_name, tag.tag_id]
                  );
                }
              }
            }
          } else {
            const res = await db.query(
              "insert into tags values(default, $1) returning *",
              [tag.tag_name]
            );
            await db.query("insert into tags_users values($1, $2)", [
              res.rows[0].tag_id,
              userid,
            ]);
          }
        });
        return { msg: "Tags updated!" };
      } catch (err) {
        return err.message;
      }
    }
  });

  // DELETE TAG
  fastify.delete("/tags/:tagid/:userid", async (request, reply) => {
    const jwt = request.headers.authorization;
    checkIfToken(jwt, reply);
    const res = await getAuthentication(jwt, reply);
    if (res) {
      try {
        const tagid = (request.params as any).tagid;
        const userid = (request.params as any).userid;
        const response = await db.query(
          "select * from notes where collection = $1 and createdby = $2",
          [tagid, userid]
        );
        if (response.rows.length < 1) {
          await db.query(
            "delete from tags_users where tag_id = $1 and userid = $2",
            [tagid, userid]
          );
          await db.query("delete from tags where tag_id = $1", [tagid]);
          return "Tag deleted!";
        } else {
          reply.status(301);
          return { error: "This Tag is still in use!" };
        }
      } catch (err) {
        return err.message;
      }
    }
  });
  done();
}
