# MongoDB Queries — MileExp Assessment

## Task 3 — Account IDs with at least one transaction below $5,000

### Using Aggregation Pipeline (recommended)
```js
db.transactions.aggregate([
  // 1. Unwind the nested transactions array into individual documents
  { $unwind: "$transactions" },

  // 2. Keep only sub-documents where amount < 5000
  { $match: { "transactions.amount": { $lt: 5000 } } },

  // 3. Group by account_id — this gives one doc per distinct account
  {
    $group: {
      _id: "$account_id"
    }
  },

  // 4. Sort ascending for clean output
  { $sort: { _id: 1 } },

  // 5. Rename _id → account_id for readable output
  {
    $project: {
      _id: 0,
      account_id: "$_id"
    }
  }
])
// Result: 1,731 account IDs
```

### Alternative — Using $elemMatch (simpler, returns full docs)
```js
db.transactions.find(
  {
    transactions: {
      $elemMatch: { amount: { $lt: 5000 } }
    }
  },
  { account_id: 1, _id: 0 }
)
```

---

## Task 4 — Distinct list of products available in the system

### Using distinct() (simplest)
```js
db.accounts.distinct("products")

// Output:
// [
//   "Brokerage",
//   "Commodity",
//   "CurrencyService",
//   "Derivatives",
//   "InvestmentFund",
//   "InvestmentStock"
// ]
```

### Using Aggregation (with account counts per product)
```js
db.accounts.aggregate([
  // Unwind the products array
  { $unwind: "$products" },

  // Group by product name and count how many accounts offer it
  {
    $group: {
      _id: "$products",
      accountCount: { $sum: 1 }
    }
  },

  // Sort alphabetically
  { $sort: { _id: 1 } },

  // Clean up output field names
  {
    $project: {
      _id: 0,
      product: "$_id",
      accountCount: 1
    }
  }
])

// Output:
// { product: "Brokerage",        accountCount: 612 }
// { product: "Commodity",        accountCount: 601 }
// { product: "CurrencyService",  accountCount: 591 }
// { product: "Derivatives",      accountCount: 618 }
// { product: "InvestmentFund",   accountCount: 599 }
// { product: "InvestmentStock",  accountCount: 620 }
```
