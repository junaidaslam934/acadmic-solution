const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-portal';
    console.log('📍 Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully!');
    
    // Test if we can find the teacher
    const TeacherSchema = new mongoose.Schema({
      email: String,
      name: String,
      employeeId: String,
      password: String,
      specialization: [String],
      isActive: Boolean,
      classAdvisor: String
    }, { timestamps: true });
    
    const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
    
    console.log('🔍 Looking for teacher with email: ja8886288@gmail.com');
    const teacher = await Teacher.findOne({ email: 'ja8886288@gmail.com' });
    
    if (teacher) {
      console.log('👨‍🏫 Teacher found!');
      console.log('📧 Email:', teacher.email);
      console.log('👤 Name:', teacher.name);
      console.log('🆔 Employee ID:', teacher.employeeId);
      console.log('🔑 Password:', teacher.password);
    } else {
      console.log('❌ Teacher not found');
      
      // Check if there are any teachers at all
      const teacherCount = await Teacher.countDocuments();
      console.log('📊 Total teachers in database:', teacherCount);
      
      if (teacherCount > 0) {
        const sampleTeacher = await Teacher.findOne();
        console.log('📝 Sample teacher:', {
          email: sampleTeacher.email,
          name: sampleTeacher.name,
          employeeId: sampleTeacher.employeeId
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('💡 Make sure MongoDB is running with: mongod');
    process.exit(1);
  }
}

testConnection();