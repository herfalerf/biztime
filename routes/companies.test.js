process.env.NODE_ENV = "test";

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

describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /companies/:code", () => {
  test("Get a single company", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: testCompany.code,
        description: testCompany.description,
        invoices: [testInvoice.id],
        name: testCompany.name,
      },
    });
  });
});

describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app).post("/companies").send({
      name: "RadioShack",
      description: "The Shack",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: "RadioShack",
        name: "RadioShack",
        description: "The Shack",
      },
    });
  });
});

describe("PUT /companies/:id", () => {
  test("Updates a single company", async () => {
    const res = await await request(app)
      .put(`/companies/${testCompany.code}`)
      .send({ name: "Target", description: "expect more" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: { code: "add", name: "Target", description: "expect more" },
    });
  });
});

describe("DELETE /companies/:code", () => {
  test("Deletes a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "DELETED!" });
  });
});
