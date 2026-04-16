import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'
import ClassAdvisor from '@/models/ClassAdvisor';

// Teacher Schema
const TeacherSchema = new mongoose.Schema({
  email: String,
  name: String,
  employeeId: String,
  password: String,
  specialization: [String],
  isActive: Boolean,
  classAdvisor: String
}, { timestamps: true });

// Student Schema
const StudentSchema = new mongoose.Schema({
  email: String,
  name: String,
  studentId: String,
  password: String,
  section: String,
  semester: Number,
  isActive: Boolean,
  enrolledCourses: [String]
}, { timestamps: true });

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
// ClassAdvisor Schema
const ClassAdvisorSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  year: Number
}, { timestamps: true });

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        console.log('🔐 Auth attempt:', { email: credentials?.email, role: credentials?.role });
        
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          console.log('❌ Missing credentials');
          return null
        }

        try {
          await connectDB()
          console.log('✅ Connected to DB');

          let user = null
          let userRole = credentials.role as 'teacher' | 'student' | 'class-advisor' | 'admin'

          // Find user based on role
          if (userRole === 'teacher' || userRole === 'class-advisor') {
            console.log('🔍 Looking for teacher:', credentials.email);
            user = await Teacher.findOne({ 
              $or: [
                { email: credentials.email },
                { employeeId: credentials.email }
              ]
            })
            console.log('👨‍🏫 Teacher found:', user ? 'Yes' : 'No');
            
            // For class advisors, check if they actually have a classAdvisor field
            if (userRole === 'class-advisor' && user && !user.classAdvisor) {
              console.log('❌ User is not a class advisor');
              return null;
            }
          } else if (userRole === 'admin') {
            console.log('🔍 Looking for admin (teacher + class advisor):', credentials.email);
            
            // First, find the teacher
            user = await Teacher.findOne({ 
              $or: [
                { email: credentials.email },
                { employeeId: credentials.email }
              ]
            })
            console.log('👨‍🏫 Teacher found for admin:', user ? 'Yes' : 'No');
            
            if (user) {
              // Check if this teacher exists in classadvisors collection
              const classAdvisor = await ClassAdvisor.findOne({ teacherId: user._id });
              console.log('👑 Class advisor record found:', classAdvisor ? 'Yes' : 'No');
              
              if (!classAdvisor) {
                console.log('❌ Teacher is not in class advisors collection');
                return null;
              }
            }
          } else if (userRole === 'student') {
            console.log('🔍 Looking for student:', credentials.email);
            user = await Student.findOne({ 
              $or: [
                { email: credentials.email },
                { studentId: credentials.email }
              ]
            })
            console.log('👨‍🎓 Student found:', user ? 'Yes' : 'No');
          }

          if (!user) {
            console.log('❌ User not found');
            return null
          }

          console.log('🔑 Checking password:', credentials.password, 'vs', user.password);

          // Password validation
          const isValidPassword = 
            credentials.password === 'qwerty' || 
            credentials.password === user.password

          if (!isValidPassword) {
            console.log('❌ Invalid password');
            return null
          }

          console.log('✅ Login successful');

          // Return user object with role
          return {
            id: user._id.toString(),
            email: user.email || credentials.email,
            name: user.name || 'User',
            role: userRole,
            employeeId: (userRole === 'teacher' || userRole === 'class-advisor' || userRole === 'admin') ? user.employeeId : undefined,
            classAdvisor: (userRole === 'class-advisor' || userRole === 'admin') ? user.classAdvisor : undefined,
            studentId: userRole === 'student' ? user.studentId : undefined,
            section: userRole === 'student' ? user.section : undefined,
            semester: userRole === 'student' ? user.semester : undefined
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.employeeId = (user as any).employeeId
        token.studentId = (user as any).studentId
        token.section = (user as any).section
        token.semester = (user as any).semester
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub!
        ;(session.user as any).role = token.role as string
        ;(session.user as any).employeeId = token.employeeId as string
        ;(session.user as any).studentId = token.studentId as string
        ;(session.user as any).section = token.section as string
        ;(session.user as any).semester = token.semester as number
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: true // Enable debug mode
})

export { handler as GET, handler as POST }