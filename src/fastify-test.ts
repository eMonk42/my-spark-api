//const fastify = require('fastify')({ logger: true })

import ff from "fastify";
const fastify = ff({
  logger: true,
});

// Declare a route
fastify.get("/", async (request, reply) => {
  //console.log(request);
  return "Woohoo!!"; //{ hello: "world" };
});

fastify.post("/", async (request, reply) => {
  console.log(request.body);
  return "Thanks!";
});

fastify.get("/random", async (request, reply) => {
  return Math.random() * 100;
});

fastify.get("/random/:num", async (request, reply) => {
  //console.log(request.url.split("/"));

  //request.params.num
  //---------- FUCK TYPESCRIPT!!!! ---------------
  const arr = request.url.split("/");
  if (typeof parseInt(arr[arr.length - 1]) == "number") {
    return Math.random() * parseInt(arr[arr.length - 1]);
  } else {
    return Math.random() * 100;
  }
});

fastify.post("/echo", async (request, reply) => {
  return request.body;
});

fastify.get("/tea", async (request, reply) => {
  reply
    .code(418)
    .header("Content-Type", "application/json; charset=utf-8")
    .send({ hello: "world" });
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
