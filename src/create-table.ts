import { db } from "./db";

export async function createTables() {
  await db.query(tableNotes);
}

const tableNotes = `create table if not exists tags(
	tag_id serial primary key,
	tag_name varchar(70) not null
);

create table if not exists notes(
	id serial primary key,
	title varchar(70) not null,
	content text,
	createdBy integer references users(id),
	collection integer references tags(tag_id),
	createdAt varchar(70) not null,
	updatedAt varchar(70) not null
);

create table if not exists users(
	id serial primary key,
	userid varchar(70) not null unique,
	profilePic varchar(70),
	nickName varchar(70)
);

create table if not exists tags_users(
	tag_id integer references tags(tag_id),
	userId integer references users(userId),
	primary key(tag_id, userId)
);`;
