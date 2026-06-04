const db = require('../config/db');

async function alterDb() {
  try {
    console.log('Adding role column to Users table...');
    await db.query(`ALTER TABLE Users ADD COLUMN role ENUM('student', 'superadmin') DEFAULT 'student'`);
    console.log('Successfully added role column.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists, ignoring.');
    } else {
      console.error('Error altering DB:', err);
    }
  } finally {
    process.exit(0);
  }
}

alterDb();
