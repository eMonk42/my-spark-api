require("dotenv").config();
// import {config} from "dotenv"
// config()
import ff from "fastify";
const fastify = ff({
  logger: true,
});

import { createTables } from "./create-table";

import { noteRoutes } from "./note-routes";
import { userRoutes } from "./user-routes";
import { tagRoutes } from "./tag-routes";

// KILL SWITCH
// fastify.delete("/kill", async (request, reply) => {
//   try {
//     await db.query("drop table notess");
//     return "All is gone";
//   } catch (err) {
//     console.log(err.message);
//   }
// });

// Run the server!
const start = async () => {
  try {
    fastify.register(require("fastify-cors"), {});

    fastify.register(noteRoutes);
    fastify.register(userRoutes);
    fastify.register(tagRoutes);
    await createTables();
    await fastify.listen(process.env.FASTIFY_PORT || 3000, "0.0.0.0");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
