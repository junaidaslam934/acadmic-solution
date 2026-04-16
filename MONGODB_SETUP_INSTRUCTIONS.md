# MongoDB Setup Instructions

## Install MongoDB on Windows

1. **Download MongoDB Community Server:**
   - Go to https://www.mongodb.com/try/download/community
   - Select Windows platform
   - Download the MSI installer

2. **Install MongoDB:**
   - Run the downloaded MSI file
   - Follow the installation wizard
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)

3. **Verify Installation:**
   ```cmd
   mongod --version
   mongo --version
   ```

## Alternative: Use MongoDB Atlas (Cloud)

If you prefer not to install MongoDB locally, you can use MongoDB Atlas:

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `.env.local` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/academic-portal
   ```

## Run the Password Setup Scripts

Once MongoDB is running, execute these scripts:

### Option 1: Update all users (teachers and students)
```cmd
node scripts/add-all-passwords.js
```

### Option 2: Update teachers only
```cmd
node scripts/add-teacher-passwords.js
```

### Option 3: Update students only
```cmd
node scripts/add-student-passwords.js
```

## Default Login Credentials

After running the scripts, all users will have the password: `qwertyuiop`

### Teacher Login Example:
- Email: `ja8886288@gmail.com`
- Password: `qwertyuiop`

OR

- Employee ID: `T001`
- Password: `qwertyuiop`

### Student Login Example:
- Email: `[student-email]`
- Password: `qwertyuiop`

OR

- Student ID: `[student-id]`
- Password: `qwertyuiop`

## Troubleshooting

If you get connection errors:
1. Make sure MongoDB service is running
2. Check if the port 27017 is available
3. Verify the connection string in `.env.local`
4. Try restarting the MongoDB service