import mongoose from "mongoose";
import dotenv from "dotenv";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env") });

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../data");

// Use strict:false so any JSON shape inserts without validation errors
const loose = new mongoose.Schema({}, { strict: false });
const Account = mongoose.model("Account", loose, "accounts");
const Customer = mongoose.model("Customer", new mongoose.Schema({}, { strict: false }), "customers");
const Transaction = mongoose.model("Transaction", new mongoose.Schema({}, { strict: false }), "transactions");

const loadJSON = (file) => {
  const path = join(DATA_DIR, file);
  if (!existsSync(path)) { console.error(`❌ Not found: ${path}`); process.exit(1); }
  console.log(`   Reading ${file}...`);
  return JSON.parse(readFileSync(path, "utf-8"));
};

const insertBatch = async (Model, data, size = 50) => {
  let ok = 0;
  for (let i = 0; i < data.length; i += size) {
    const batch = data.slice(i, i + size);
    const res = await Model.insertMany(batch, { ordered: false }).catch(e => {
      // BulkWrite partial success — some docs inserted
      return e.result || { insertedCount: 0 };
    });
    ok += res?.insertedCount ?? batch.length;
    process.stdout.write(`\r   Inserted ${Math.min(i + size, data.length)}/${data.length}`);
  }
  process.stdout.write("\n");
  return ok;
};

const seed = async () => {
  let uri = process.env.MONGO_URI || "mongodb://localhost:27017/mileexp";
  // Force database name = mileexp  (Atlas URIs often have no db name before ?)
  uri = uri.replace(/(mongodb\+srv:\/\/[^/]+)(\/?)(\?|$)/, "$1/mileexp$3");
  
  console.log("🔗 Connecting:", uri.replace(/:([^@:]+)@/, ":****@"));
  await mongoose.connect(uri);
  const db = mongoose.connection.db.databaseName;
  console.log(`✅ Connected — database: "${db}"\n`);

  console.log("📦 Seeding accounts...");
  await Account.deleteMany({});
  const accounts = loadJSON("accounts.json");
  await insertBatch(Account, accounts);
  console.log(`   ✔ ${await Account.countDocuments()} accounts\n`);

  console.log("📦 Seeding customers...");
  await Customer.deleteMany({});
  const customers = loadJSON("customers.json");
  await insertBatch(Customer, customers);
  console.log(`   ✔ ${await Customer.countDocuments()} customers\n`);

  console.log("📦 Seeding transactions (may take ~30s)...");
  await Transaction.deleteMany({});
  const transactions = loadJSON("transactions.json");
  await insertBatch(Transaction, transactions, 20);
  console.log(`   ✔ ${await Transaction.countDocuments()} transaction buckets\n`);

  console.log("🎉 Seed complete!");
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error("❌ Seed failed:", err.message); process.exit(1); });
