import ff from "fastify";
const fastify = ff({
  logger: true,
});
require("dotenv").config();
//import fc from "fastify-cors";

import { db } from "./db";
import { createTables } from "./create-table";

//----------------------------NOTES-----------------------------------
// READ ALL
fastify.get("/notes", async (request, reply) => {
  try {
    const res = await db.query(
      //"create table notes( note_id serial primary key, title varchar(70) not null, content text); insert into notes values(default, 'Hello', 'World'); select * from notes"
      "select * from notes order by createdat asc"
    );
    reply.header("Access-Control-Allow-Origin", "*");
    return res.rows;
  } catch (err) {
    return err.message;
  }
});

// READ SINGLE
fastify.get("/notes/:id", async (request, reply) => {
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
});

interface UpdateNoteDto {
  title?: string;
  content?: string;
  createdby?: number;
  createdat?: string;
  updatedat?: string;
  collection?: number;
}

// UPDATE NOTE
fastify.patch("/notes/:id", async (request, reply) => {
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
});

// CREATE NOTE
fastify.post("/notes", async (request, reply) => {
  try {
    const { title, content, createdby, collection, createdat, updatedat } =
      request.body as UpdateNoteDto;
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Method", "*");
    if (!title && !content) {
      reply.status(400);
      return { error: "There is no data to create a new note" };
    }
    if (!title) return "There is no title!";
    const res = await db.query(
      "insert into notes values(default, $1, $2, $3, $4, $5, $6) returning *",
      [title, content, createdby, collection, createdat, updatedat]
    );
    if (res.rows[0]) {
      return res.rows;
    } else {
      return "Something went wrong!";
    }
  } catch (err) {
    return err.message;
  }
});

// DELETE NOTE
fastify.delete("/notes/:id", async (request, reply) => {
  try {
    const arr = request.url.split("/");
    const res = await db.query("delete from notes where id = $1 returning *", [
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
});

//--------------------------------USERS------------------------------------------
// GET USER
fastify.get("/users/:userid", async (request, reply) => {
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
});

// UPDATE USER
fastify.patch("/users", async (request, reply) => {
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
});

//--------------------------------TAGS------------------------------------------
async function getTagForUser(userid) {
  const res = await db.query("select * from tags_users where userid = $1", [
    userid,
  ]);
  const tagsFromInter = await res.rows;
  const tags = [];
  for (let i = 0; i < tagsFromInter.length; i++) {
    const id = tagsFromInter[i].tag_id;
    const res = await db.query("select * from tags where tag_id=$1", [id]);
    tags.push(res.rows[0]);
  }
  return tags;
}

// using joined tables:
//"select tags.tag_id, tags.tag_name from tags_users join tags on tags_users.tag_id=tags.tag_id where tags_users.userid = $1", [userid]

// GET TAGS FOR USER
fastify.get("/tags/:userid", async (request, reply) => {
  try {
    const userid = (request.params as any).userid;
    return { tags: await getTagForUser(userid) };
  } catch (err) {
    return err.message;
  }
});

// UPDATE TAGS
fastify.post("/tags/:userid", async (request, reply) => {
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
    //return data;
    const userid = (request.params as any).userid;
    if (data.length < 2) return "You must have at least one Tag!";

    const tags = await getTagForUser(userid);

    //console.log(tags);
    //const returnArray = [];

    data.forEach(async (tag) => {
      if (tag.tag_id) {
        for (let i = 0; i < tags.length; i++) {
          if (tags[i].tag_id == tag.tag_id) {
            if (tags[i].tag_name != tag.tag_name) {
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
});

// DELETE TAG
fastify.delete("/tags/:tagid/:userid", async (request, reply) => {
  try {
    const tagid = (request.params as any).tagid;
    const userid = (request.params as any).userid;
    // check if tag is still in use and if yes return
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
      return "Tag deleted!"; //res.rows[0];
    } else {
      reply.status(301);
      return { error: "This Tag is still in use!" };
    }
  } catch (err) {
    return err.message;
  }
});

// KILL SWITCH
fastify.delete("/kill", async (request, reply) => {
  try {
    await db.query("drop table notess");
    return "All is gone";
  } catch (err) {
    console.log(err.message);
  }
});

// Run the server!
const start = async () => {
  try {
    //await db.connect();
    fastify.register(require("fastify-cors"), {
      // let corsOptions;
      // put your options here
      // corsOptions = {origin: false}
      // callback(null, corsOptions)
    });
    await createTables();
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
