create extension if not exists timescaledb;

create table if not exists readings (
  id bigserial,
  node_id text not null,
  locality_id text not null,
  water_level_cm numeric not null,
  alert_level text not null,
  lat double precision not null,
  lng double precision not null,
  recorded_at timestamptz not null,
  inserted_at timestamptz not null default now(),

  primary key (id, recorded_at)
);

create index if not exists readings_node_id_recorded_at_idx
  on readings (node_id, recorded_at desc);

create index if not exists readings_locality_id_recorded_at_idx
  on readings (locality_id, recorded_at desc);

select create_hypertable('readings', 'recorded_at', if_not_exists => true);
