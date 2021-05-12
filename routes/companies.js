const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT code, name, description FROM companies`
    );
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const compResults = await db.query(
      `SELECT c.code, c.name, c.description, i.industry
      FROM companies AS c
      LEFT JOIN companies_industries AS ci 
      ON c.code = ci.comp_code
      LEFT JOIN industries AS i 
      ON ci.ind_code = i.code
      WHERE c.code = $1`,
      [req.params.code]
    );

    const invResults = await db.query(
      "SELECT id FROM invoices WHERE comp_code = $1",
      [req.params.code]
    );
    if (compResults.rows.length === 0) {
      throw new ExpressError(
        `Can't find company with code of ${req.params.code}`,
        404
      );
    }

    const { code, name, description } = compResults.rows[0];
    const industries = compResults.rows.map((r) => r.industry);
    // const invoices = invResults.rows;

    const invoices = invResults.rows.map((inv) => inv.id);
    // company.invoices = invoices.map((inv) => inv.id);

    return res.json({
      company: { code, name, description, industries, invoices },
    });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name);
    const results = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      "UPDATE companies SET name =$2, description =$3 WHERE code=$1 RETURNING code, name, description",
      [code, name, description]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code}`, 404);
    }
    return res.send({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const results = await db.query("DELETE FROM companies WHERE code=$1", [
      req.params.code,
    ]);
    if (results.rowCount === 0) {
      throw new ExpressError(`Company not found`, 404);
    }
    return res.send({ msg: "DELETED!" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
