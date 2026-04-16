# MongoDB Connection Setup

## Step 1: Update Environment Variables

Open the `.env.local` file and replace `<db_password>` with your actual MongoDB password:

```env
MONGODB_URI=mongodb+srv://acadmics:YOUR_ACTUAL_PASSWORD@cluster0.1uu78bm.mongodb.net/
```

**Important**: Replace `YOUR_ACTUAL_PASSWORD` with the password you created for the `acadmics` user in MongoDB Atlas.

## Step 2: Test the Connection

Once you've updated the password, you can test the connection by:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit this URL in your browser:
   ```
   http://localhost:3000/api/test-db
   ```

3. You should see a JSON response showing:
   - Connection status
   - Count of documents in each collection (admins, teachers, academics)

## What I've Created

### Files Created:
1. **`src/lib/mongodb.ts`** - Database connection manager with connection pooling
2. **`src/models/Admin.ts`** - Mongoose model for admin collection
3. **`src/models/Teacher.ts`** - Mongoose model for teachers collection
4. **`src/models/Academic.ts`** - Mongoose model for academics collection
5. **`src/app/api/test-db/route.ts`** - Test endpoint to verify connection
6. **`.env.local`** - Environment variables (UPDATE THE PASSWORD HERE)

### Packages Installed:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `@types/bcryptjs` - TypeScript types
- `@types/jsonwebtoken` - TypeScript types

## Next Steps

After confirming the connection works, I can:
1. Update your existing API routes to use the database
2. Implement authentication with the database
3. Create additional models for other collections
4. Add password hashing and JWT authentication

## Troubleshooting

If you get connection errors:
- Make sure your IP address is whitelisted in MongoDB Atlas
- Verify the password is correct (no special characters that need URL encoding)
- Check that the database name is correct
- Ensure your MongoDB Atlas cluster is running
