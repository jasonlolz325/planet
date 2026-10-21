import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

type Space = { id: number; name: string; role: string };
type Channel = { id: number; name: string };
type Message = {
  id: number;
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

async function ensureLobby(userId: string, displayName: string) {
  const sql = await getSql();
  const existing = await sql<{ id: number }>`select id from spaces order by id asc limit 1`;
  let spaceId = existing[0]?.id;
  if (!spaceId) {
    const created = await sql<{ id: number }>`
      insert into spaces (name, created_by) values ('Hearth', ${userId}) returning id
    `;
    spaceId = created[0].id;
    await sql`insert into channels (space_id, name) values (${spaceId}, 'general')`;
    await sql`insert into channels (space_id, name) values (${spaceId}, 'introductions')`;
  }
  await sql`
    insert into memberships (space_id, user_id, display_name, role)
    values (${spaceId}, ${userId}, ${displayName}, 'member')
    on conflict (space_id, user_id) do update set display_name = ${displayName}
  `;
}

export const listSpaces = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName: string }) => {
    const displayName = (input.displayName || "Member").slice(0, 40);
    return { displayName };
  })
  .handler(async ({ context, data }) => {
    await ensureLobby(context.userId, data.displayName);
    const sql = await getSql();
    const mine = await sql<Space>`
      select s.id, s.name, m.role
      from spaces s
      join memberships m on m.space_id = s.id
      where m.user_id = ${context.userId}
      order by s.id asc
    `;
    const discover = await sql<{ id: number; name: string }>`
      select s.id, s.name from spaces s
      where not exists (
        select 1 from memberships m where m.space_id = s.id and m.user_id = ${context.userId}
      )
      order by s.id asc
    `;
    return { mine, discover };
  });

export const createSpace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; displayName: string }) => ({
    name: input.name.trim().slice(0, 32),
    displayName: (input.displayName || "Member").slice(0, 40),
  }))
  .handler(async ({ context, data }) => {
    if (!data.name) throw new Error("Name required");
    const sql = await getSql();
    const created = await sql<{ id: number }>`
      insert into spaces (name, created_by) values (${data.name}, ${context.userId}) returning id
    `;
    const id = created[0].id;
    await sql`
      insert into memberships (space_id, user_id, display_name, role)
      values (${id}, ${context.userId}, ${data.displayName}, 'owner')
    `;
    await sql`insert into channels (space_id, name) values (${id}, 'general')`;
    return { id };
  });

export const joinSpace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { spaceId: number; displayName: string }) => ({
    spaceId: Number(input.spaceId),
    displayName: (input.displayName || "Member").slice(0, 40),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into memberships (space_id, user_id, display_name, role)
      values (${data.spaceId}, ${context.userId}, ${data.displayName}, 'member')
      on conflict (space_id, user_id) do nothing
    `;
    return { ok: true };
  });

async function assertMember(userId: string, spaceId: number) {
  const sql = await getSql();
  const rows = await sql<{ ok: number }>`
    select 1 as ok from memberships where space_id = ${spaceId} and user_id = ${userId}
  `;
  if (!rows.length) throw new Error("Not a member");
}

export const listChannels = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { spaceId: number }) => ({ spaceId: Number(input.spaceId) }))
  .handler(async ({ context, data }) => {
    await assertMember(context.userId, data.spaceId);
    const sql = await getSql();
    return sql<Channel>`
      select id, name from channels where space_id = ${data.spaceId} order by id asc
    `;
  });

export const createChannel = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { spaceId: number; name: string }) => ({
    spaceId: Number(input.spaceId),
    name: input.name.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24),
  }))
  .handler(async ({ context, data }) => {
    if (!data.name) throw new Error("Name required");
    await assertMember(context.userId, data.spaceId);
    const sql = await getSql();
    const created = await sql<{ id: number }>`
      insert into channels (space_id, name) values (${data.spaceId}, ${data.name}) returning id
    `;
    return { id: created[0].id };
  });

export const listMessages = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { channelId: number }) => ({ channelId: Number(input.channelId) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const allowed = await sql<{ ok: number }>`
      select 1 as ok from channels c
      join memberships m on m.space_id = c.space_id
      where c.id = ${data.channelId} and m.user_id = ${context.userId}
    `;
    if (!allowed.length) throw new Error("Not a member");
    return sql<Message>`
      select id, user_id as "userId", author_name as "authorName", body,
             to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt"
      from messages
      where channel_id = ${data.channelId}
      order by id asc
      limit 200
    `;
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { channelId: number; body: string; authorName: string }) => ({
    channelId: Number(input.channelId),
    body: input.body.trim().slice(0, 2000),
    authorName: (input.authorName || "Member").slice(0, 40),
  }))
  .handler(async ({ context, data }) => {
    if (!data.body) throw new Error("Empty");
    const sql = await getSql();
    const allowed = await sql<{ ok: number }>`
      select 1 as ok from channels c
      join memberships m on m.space_id = c.space_id
      where c.id = ${data.channelId} and m.user_id = ${context.userId}
    `;
    if (!allowed.length) throw new Error("Not a member");
    const created = await sql<{ id: number }>`
      insert into messages (channel_id, user_id, author_name, body)
      values (${data.channelId}, ${context.userId}, ${data.authorName}, ${data.body})
      returning id
    `;
    return { id: created[0].id };
  });
