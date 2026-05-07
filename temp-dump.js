import { createClient } from '@libsql/client';
const db = createClient({ url: 'file:/data/database.sqlite' });
async function run() {
  const res = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='settings'");
  console.log(res.rows[0]);
}
run();
