create table if not exists spaces (
  id serial primary key,
  name text not null,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  space_id integer not null references spaces(id) on delete cascade,
  user_id text not null,
  display_name text not null,
  role text not null default 'member',
  primary key (space_id, user_id)
);

create table if not exists channels (
  id serial primary key,
  space_id integer not null references spaces(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id serial primary key,
  channel_id integer not null references channels(id) on delete cascade,
  user_id text not null,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_channel_idx on messages (channel_id, id);
create index if not exists memberships_user_idx on memberships (user_id);
