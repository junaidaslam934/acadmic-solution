import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'teacher' | 'student' | 'admin'
      employeeId?: string
      rollNumber?: string
      year?: number
      section?: string
      adminRole?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'teacher' | 'student' | 'admin'
    employeeId?: string
    rollNumber?: string
    year?: number
    section?: string
    adminRole?: string
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
  }
}