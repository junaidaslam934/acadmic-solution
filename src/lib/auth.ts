import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'teacher' | 'student' | 'class-advisor' | 'admin'
      employeeId?: string
      rollNumber?: string
      year?: number
      section?: string
      adminRole?: string
      classAdvisor?: string
      studentId?: string
      semester?: number
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    role?: 'teacher' | 'student' | 'class-advisor' | 'admin'
    employeeId?: string
    rollNumber?: string
    year?: number
    section?: string
    adminRole?: string
    classAdvisor?: string
    studentId?: string
    semester?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    employeeId?: string
    rollNumber?: string
    year?: number
    section?: string
    adminRole?: string
    classAdvisor?: string
    studentId?: string
    semester?: number
  }
}
