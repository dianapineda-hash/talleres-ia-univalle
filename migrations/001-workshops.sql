CREATE TABLE IF NOT EXISTS workshop_users (
  id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE CHECK (username = lower(username)),
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'student')),
  active boolean NOT NULL DEFAULT true,
  must_change_password boolean NOT NULL DEFAULT true,
  salt text NOT NULL,
  hash text NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0)
);

CREATE TABLE IF NOT EXISTS workshop_progress (
  user_id uuid NOT NULL REFERENCES workshop_users(id),
  course integer NOT NULL CHECK (course IN (1, 2)),
  unit integer NOT NULL CHECK (unit BETWEEN 1 AND 7),
  opened boolean NOT NULL DEFAULT false,
  answer integer CHECK (answer BETWEEN 0 AND 10),
  explained boolean NOT NULL DEFAULT false,
  completed boolean NOT NULL DEFAULT false,
  seconds double precision NOT NULL DEFAULT 0 CHECK (seconds >= 0 AND seconds < 1000000000),
  PRIMARY KEY (user_id, course, unit)
);
