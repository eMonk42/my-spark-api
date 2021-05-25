import { FusionAuthClient } from "@fusionauth/typescript-client";

const fusionAuth = new FusionAuthClient(
  process.env.FUSION_AUTH_API_KEY,
  process.env.FUSION_AUTH_URL
);

export async function getAuthentication(jwt, reply) {
  try {
    const res = await fusionAuth.validateJWT(jwt);
    if (res.statusCode != 200) {
      reply.status(res.statusCode);
      reply.send();
    }
    return res;
  } catch (err) {
    console.log(err);
    reply.status(err.statusCode);
    reply.send();
    return false;
  }
}

export function checkIfToken(jwt, reply) {
  if (!jwt) {
    reply.status(201);
    return "permission denied! Please supply a Token in your request-header";
  }
}
