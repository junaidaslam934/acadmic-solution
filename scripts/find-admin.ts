import mongoose from 'mongoose';
import Admin from '../src/models/Admin';
import connectDB from '../src/lib/mongodb';

async function findAdmin(adminId: string) {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      console.error('❌ Invalid MongoDB ID format');
      process.exit(1);
    }
    
    console.log(`\nSearching for admin with ID: ${adminId}`);
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      console.error('❌ Admin not found with this ID');
      process.exit(1);
    }
    
    console.log('\n✅ Admin found:');
    console.log('─'.repeat(50));
    console.log(`ID:          ${admin._id}`);
    console.log(`Email:       ${admin.email}`);
    console.log(`Name:        ${admin.name}`);
    console.log(`Role:        ${admin.role}`);
    console.log(`Active:      ${admin.isActive}`);
    console.log(`Permissions: ${admin.permissions.join(', ') || 'None'}`);
    console.log(`Last Login:  ${admin.lastLoginAt || 'Never'}`);
    console.log(`Created:     ${admin.createdAt}`);
    console.log('─'.repeat(50));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

const adminId = process.argv[2];
if (!adminId) {
  console.error('Usage: npm run find-admin <admin_id>');
  process.exit(1);
}

findAdmin(adminId);
