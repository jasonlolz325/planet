import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-B-hXRsnp.mjs";
import { t as authMiddleware } from "./middleware-BVcyflV7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat.functions-DwE0BDVk.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function ensureLobby(userId, displayName) {
	const sql = await getSql();
	let spaceId = (await sql`select id from spaces order by id asc limit 1`)[0]?.id;
	if (!spaceId) {
		spaceId = (await sql`
      insert into spaces (name, created_by) values ('Hearth', ${userId}) returning id
    `)[0].id;
		await sql`insert into channels (space_id, name) values (${spaceId}, 'general')`;
		await sql`insert into channels (space_id, name) values (${spaceId}, 'introductions')`;
	}
	await sql`
    insert into memberships (space_id, user_id, display_name, role)
    values (${spaceId}, ${userId}, ${displayName}, 'member')
    on conflict (space_id, user_id) do update set display_name = ${displayName}
  `;
}
var listSpaces_createServerFn_handler = createServerRpc({
	id: "a275d2a2ca7bac930ed0395daae259813285192cff11ceddf53c9a85aa862db5",
	name: "listSpaces",
	filename: "src/lib/chat.functions.ts"
}, (opts) => listSpaces.__executeServer(opts));
var listSpaces = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { displayName: (input.displayName || "Member").slice(0, 40) };
}).handler(listSpaces_createServerFn_handler, async ({ context, data }) => {
	await ensureLobby(context.userId, data.displayName);
	const sql = await getSql();
	return {
		mine: await sql`
      select s.id, s.name, m.role
      from spaces s
      join memberships m on m.space_id = s.id
      where m.user_id = ${context.userId}
      order by s.id asc
    `,
		discover: await sql`
      select s.id, s.name from spaces s
      where not exists (
        select 1 from memberships m where m.space_id = s.id and m.user_id = ${context.userId}
      )
      order by s.id asc
    `
	};
});
var createSpace_createServerFn_handler = createServerRpc({
	id: "eec62aa7517520e9eccf1fb88680f024738de989576647654451484ad240a877",
	name: "createSpace",
	filename: "src/lib/chat.functions.ts"
}, (opts) => createSpace.__executeServer(opts));
var createSpace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	name: input.name.trim().slice(0, 32),
	displayName: (input.displayName || "Member").slice(0, 40)
})).handler(createSpace_createServerFn_handler, async ({ context, data }) => {
	if (!data.name) throw new Error("Name required");
	const sql = await getSql();
	const id = (await sql`
      insert into spaces (name, created_by) values (${data.name}, ${context.userId}) returning id
    `)[0].id;
	await sql`
      insert into memberships (space_id, user_id, display_name, role)
      values (${id}, ${context.userId}, ${data.displayName}, 'owner')
    `;
	await sql`insert into channels (space_id, name) values (${id}, 'general')`;
	return { id };
});
var joinSpace_createServerFn_handler = createServerRpc({
	id: "451d1ff3483b04369f028fc26a39bd50683f6cd2475719fabf2034d93d9c8a66",
	name: "joinSpace",
	filename: "src/lib/chat.functions.ts"
}, (opts) => joinSpace.__executeServer(opts));
var joinSpace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	spaceId: Number(input.spaceId),
	displayName: (input.displayName || "Member").slice(0, 40)
})).handler(joinSpace_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      insert into memberships (space_id, user_id, display_name, role)
      values (${data.spaceId}, ${context.userId}, ${data.displayName}, 'member')
      on conflict (space_id, user_id) do nothing
    `;
	return { ok: true };
});
async function assertMember(userId, spaceId) {
	if (!(await (await getSql())`
    select 1 as ok from memberships where space_id = ${spaceId} and user_id = ${userId}
  `).length) throw new Error("Not a member");
}
var listChannels_createServerFn_handler = createServerRpc({
	id: "877da657b39eaac1bf4c03c21b23d29b02a4650f453ed848a8a199355264ec92",
	name: "listChannels",
	filename: "src/lib/chat.functions.ts"
}, (opts) => listChannels.__executeServer(opts));
var listChannels = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ spaceId: Number(input.spaceId) })).handler(listChannels_createServerFn_handler, async ({ context, data }) => {
	await assertMember(context.userId, data.spaceId);
	return (await getSql())`
      select id, name from channels where space_id = ${data.spaceId} order by id asc
    `;
});
var createChannel_createServerFn_handler = createServerRpc({
	id: "64eab9673dd107219aa3c67db63d28d882953f8294ee06593da5f76bfee1bef5",
	name: "createChannel",
	filename: "src/lib/chat.functions.ts"
}, (opts) => createChannel.__executeServer(opts));
var createChannel = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	spaceId: Number(input.spaceId),
	name: input.name.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24)
})).handler(createChannel_createServerFn_handler, async ({ context, data }) => {
	if (!data.name) throw new Error("Name required");
	await assertMember(context.userId, data.spaceId);
	return { id: (await (await getSql())`
      insert into channels (space_id, name) values (${data.spaceId}, ${data.name}) returning id
    `)[0].id };
});
var listMessages_createServerFn_handler = createServerRpc({
	id: "2b959b7bd43ddd43a51e1dd9cca95badc1092b76bd0f9c4baae4684fedba09b7",
	name: "listMessages",
	filename: "src/lib/chat.functions.ts"
}, (opts) => listMessages.__executeServer(opts));
var listMessages = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ channelId: Number(input.channelId) })).handler(listMessages_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!(await sql`
      select 1 as ok from channels c
      join memberships m on m.space_id = c.space_id
      where c.id = ${data.channelId} and m.user_id = ${context.userId}
    `).length) throw new Error("Not a member");
	return sql`
      select id, user_id as "userId", author_name as "authorName", body,
             to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt"
      from messages
      where channel_id = ${data.channelId}
      order by id asc
      limit 200
    `;
});
var sendMessage_createServerFn_handler = createServerRpc({
	id: "4f34919086f2a4130097c5da5423c36b625cea14ed1b142c70bfe1b53f9fd398",
	name: "sendMessage",
	filename: "src/lib/chat.functions.ts"
}, (opts) => sendMessage.__executeServer(opts));
var sendMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	channelId: Number(input.channelId),
	body: input.body.trim().slice(0, 2e3),
	authorName: (input.authorName || "Member").slice(0, 40)
})).handler(sendMessage_createServerFn_handler, async ({ context, data }) => {
	if (!data.body) throw new Error("Empty");
	const sql = await getSql();
	if (!(await sql`
      select 1 as ok from channels c
      join memberships m on m.space_id = c.space_id
      where c.id = ${data.channelId} and m.user_id = ${context.userId}
    `).length) throw new Error("Not a member");
	return { id: (await sql`
      insert into messages (channel_id, user_id, author_name, body)
      values (${data.channelId}, ${context.userId}, ${data.authorName}, ${data.body})
      returning id
    `)[0].id };
});
//#endregion
export { createChannel_createServerFn_handler, createSpace_createServerFn_handler, joinSpace_createServerFn_handler, listChannels_createServerFn_handler, listMessages_createServerFn_handler, listSpaces_createServerFn_handler, sendMessage_createServerFn_handler };
