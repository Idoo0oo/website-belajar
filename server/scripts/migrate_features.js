require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    console.log('Running migrations...');

    // Add auth columns to Users (ignore if already exist)
    try {
      await conn.execute(`ALTER TABLE Users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE`);
      console.log('✅ Added email_verified');
    } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; console.log('ℹ️ email_verified exists'); }

    try {
      await conn.execute(`ALTER TABLE Users ADD COLUMN verification_token VARCHAR(255) NULL`);
      console.log('✅ Added verification_token');
    } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; console.log('ℹ️ verification_token exists'); }

    try {
      await conn.execute(`ALTER TABLE Users ADD COLUMN reset_token VARCHAR(255) NULL`);
      console.log('✅ Added reset_token');
    } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; console.log('ℹ️ reset_token exists'); }

    try {
      await conn.execute(`ALTER TABLE Users ADD COLUMN reset_token_expires DATETIME NULL`);
      console.log('✅ Added reset_token_expires');
    } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; console.log('ℹ️ reset_token_expires exists'); }

    // Create QuizResults table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS QuizResults (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        material_id INT NOT NULL,
        score INT NOT NULL,
        total INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (material_id) REFERENCES Materials(id) ON DELETE CASCADE,
        INDEX idx_quiz_results_user (user_id),
        INDEX idx_quiz_results_material (material_id)
      ) ENGINE=InnoDB
    `);
    console.log('✅ QuizResults table ready');

    console.log('\n🎉 All migrations complete!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await conn.end();
  }
})();
