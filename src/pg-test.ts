import { Client } from "pg";

const client = new Client({
  user: "spark",
  database: "spark",
  password: "mysparkpassword",
  host: "localhost",
  port: 5432,
});

async function main() {
  try {
    await client.connect();
    const res = await client.query(
      //"create table notes( note_id serial primary key, title varchar(70) not null, content text); insert into notes values(default, 'Hello', 'World'); select * from notes"
      "select * from notes"
    );
    console.log(res.rows[0].title, res.rows[0].content);
    await client.end();
  } catch (err) {
    console.log(err.message);
  }
}

main();
