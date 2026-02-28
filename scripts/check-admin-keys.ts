import Admin from '../src/models/Admin';
import connectDB from '../src/lib/mongodb';

async function checkAdminKeys() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('\nFetching all admins...');
    const admins = await Admin.find({});
    
    if (admins.length === 0) {
      console.log('No admins found in database');
      process.exit(0);
    }
    
    console.log(`Found ${admins.length} admin(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`);
      console.log(`  ID: ${admin._id}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Name: ${admin.name}`);
      console.log(`  Active: ${admin.isActive}`);
      console.log(`  Key field type: ${typeof admin.key}`);
      console.log(`  Key value:`, admin.key);
      console.log(`  Key JSON:`, JSON.stringify(admin.key, null, 2));
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminKeys();
