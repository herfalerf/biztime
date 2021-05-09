process.env.NODE_ENV = "test";

const express = require("express");
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
let testInvoice;
beforeEach(async () => {
  const compResult = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('add', 'Adidas', 'Three stripes') RETURNING code, name, description`
  );
  testCompany = compResult.rows[0];

  const invResult = await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('add', 25, false, null) RETURNING id, comp_code, amt, paid, add_date, paid_date`
  );

  //must stringify results or add_date will return as an date instead of as string and confuse our tests
  const json = JSON.stringify(invResult.rows[0]);
  //must parse json to convert back to format that matches route test results
  testInvoice = JSON.parse(json);
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
  db.end();
});

describe("GET /invoices", () => {
  test("Get a list with one invoice", async () => {
    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([testInvoice]);
  });
});
