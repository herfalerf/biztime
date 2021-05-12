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

describe("GET /invoices/:id", () => {
  test("Get a single invoice by ID", async () => {
    const res = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.invoice).toEqual({
      add_date: expect.anything(),
      amt: 25,
      company: { code: "add", description: "Three stripes", name: "Adidas" },
      id: testInvoice.id,
      paid: false,
      paid_date: null,
    });
  });
});

describe("POST /invoices", () => {
  test("create a new invoice", async () => {
    const res = await request(app)
      .post("/invoices")
      .send({ comp_code: "add", amt: 40, paid: false, paid_date: null });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: {
        add_date: expect.anything(),
        amt: 40,
        comp_code: "add",
        id: expect.any(Number),
        paid: false,
        paid_date: null,
      },
    });
  });
});

describe("PUT /invoices/:id", () => {
  test("Updates a single invoice", async () => {
    const res = await request(app)
      .put(`/invoices/${testInvoice.id}`)
      .send({ comp_code: "add", amt: 1000, paid: false, paid_date: null });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: [
        {
          amt: 1000,
          comp_code: "add",
          id: expect.any(Number),
          paid: false,
          paid_date: null,
        },
      ],
    });
  });
});

describe("DELETE /invoices/:id", () => {
  test("Deletes a single invoice", async () => {
    const res = await request(app).delete(`/invoices/${testInvoice.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "DELETED!" });
  });
});
