const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices`
    );
    return res.json(results.rows);
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(
      `SELECT i.id,
                                           i.comp_code,
                                           i.amt, 
                                           i.paid,
                                           i.add_date,
                                           i.paid_date,
                                           c.name,
                                           c.description
                                            FROM invoices AS i
                                            INNER JOIN companies AS c ON (i.comp_code = c.code) 
                                            WHERE id = $1`,
      [id]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
    const data = results.rows[0];
    const invoice = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
    };
    return res.json({ invoice: invoice });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt, paid, paid_date } = req.body;
    const results = await db.query(
      "INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ($1, $2, $3, $4) RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [comp_code, amt, paid, paid_date]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comp_code, amt, paid, paid_date } = req.body;
    const results = await db.query(
      "UPDATE invoices SET comp_code=$1, amt=$2, paid=$3, paid_date=$4 WHERE id = $5 RETURNING id, comp_code, amt, paid, paid_date",
      [comp_code, amt, paid, paid_date, id]
    );
    return res.json({ invoice: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const results = await db.query("DELETE FROM invoices WHERE id = $1", [
      req.params.id,
    ]);
    if (results.rowCount === 0) {
      throw new ExpressError(`Invoice not found`, 404);
    }
    return res.send({ msg: "DELETED!" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
