CREATE TABLE rfp (
id uuid PRIMARY KEY,
title text,
structured jsonb,
raw_text text,
created_at timestamptz DEFAULT now()
);


CREATE TABLE vendors (
id uuid PRIMARY KEY,
na
