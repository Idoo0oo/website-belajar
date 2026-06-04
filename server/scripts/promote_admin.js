const db = require('../config/db');

async function promoteAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node promote_admin.js <user_email>');
    process.exit(1);
  }

  try {
    const [result] = await db.query('UPDATE Users SET role = "superadmin" WHERE email = ?', [email]);
    if (result.affectedRows === 0) {
      console.log(`User with email ${email} not found.`);
    } else {
      console.log(`Successfully promoted ${email} to superadmin!`);
    }
  } catch (err) {
    console.error('Error promoting user:', err);
  } finally {
    process.exit(0);
  }
}

promoteAdmin();
