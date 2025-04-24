// This is a simple script to add the image_url column to the practice_task table
import { createClient } from '@vercel/postgres';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Adding image_url column to practice_task table...');
    
    const result = await client.query(`
      ALTER TABLE practice_task
      ADD COLUMN IF NOT EXISTS image_url text;
    `);
    
    console.log('Column added successfully!');
    return result;
  } catch (error) {
    console.error('Error adding column:', error);
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('Table might not exist yet. Run migrations first.');
    }
  } finally {
    await client.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  }); 