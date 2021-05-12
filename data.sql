DROP DATABASE IF EXISTS biztime_test;

CREATE DATABASE biztime_test;

\c biztime_test;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code TEXT PRIMARY KEY,
  industry TEXT NOT NULL UNIQUE
);

CREATE TABLE companies_industries (
  comp_code TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
  ind_code text NOT NULL REFERENCES industries ON DELETE CASCADE,
  PRIMARY KEY(comp_code, ind_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('jpmorgan', 'JP Morgan', 'Some bank'),
         ('nike', 'NIKE', 'Just do it.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);
         

INSERT INTO industries (code, industry)
VALUES ('acct', 'accounting'), 
('software', 'software'), 
('tech', 'technology'), 
('clothes', 'clothing manufacturing');

INSERT INTO companies_industries (comp_code, ind_code)
VALUES
  ('apple', 'software'),
  ('apple', 'tech'),
  ('ibm', 'software'),
  ('ibm', 'tech'),
  ('jpmorgan', 'acct'),
  ('nike', 'clothes');

