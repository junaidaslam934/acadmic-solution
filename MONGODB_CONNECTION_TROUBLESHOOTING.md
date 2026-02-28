# MongoDB Connection Troubleshooting

## Current Error
```
MongooseServerSelectionError: A0800000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

This error typically occurs due to:

## 1. IP Address Not Whitelisted ⚠️ MOST COMMON

**Solution:**
1. Go to MongoDB Atlas Dashboard: https://cloud.mongodb.com/
2. Click on "Network Access" in the left sidebar
3. Click "Add IP Address"
4. Either:
   - Click "Add Current IP Address" to whitelist your current IP
   - OR click "Allow Access from Anywhere" (0.0.0.0/0) for development

**Note:** If you're on a dynamic IP (changes frequently), you may need to use "Allow Access from Anywhere" for development.

## 2. Firewall/Antivirus Blocking Connection

**Solution:**
- Temporarily disable your firewall/antivirus
- Add an exception for Node.js in your firewall settings
- Check if your organization/ISP blocks MongoDB Atlas ports

## 3. VPN or Proxy Issues

**Solution:**
- Try disconnecting from VPN
- Disable any proxy settings
- Try from a different network

## 4. MongoDB Atlas Cluster Issues

**Solution:**
- Check if your cluster is running in MongoDB Atlas dashboard
- Verify the cluster hasn't been paused
- Check MongoDB Atlas status page: https://status.mongodb.com/

## 5. Connection String Issues

**Current Connection String:**
```
mongodb+srv://acadmics:vL1snO9Eg9CYv0xw@cluster0.1uu78bm.mongodb.net/academics?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true
```

**Verify:**
- Username: `acadmics`
- Password: `vL1snO9Eg9CYv0xw`
- Cluster: `cluster0.1uu78bm.mongodb.net`
- Database: `academics`

## Quick Test

Try this command in your terminal to test the connection:
```bash
curl -v https://cluster0.1uu78bm.mongodb.net
```

If this fails, it's likely a network/firewall issue.

## Recommended Next Steps

1. **First, whitelist your IP in MongoDB Atlas** (most likely fix)
2. Check if you can access the MongoDB Atlas dashboard
3. Try the connection from a different network
4. Contact your network administrator if on a corporate network

## Alternative: Use MongoDB Compass

Download MongoDB Compass and try connecting with this connection string:
```
mongodb+srv://acadmics:vL1snO9Eg9CYv0xw@cluster0.1uu78bm.mongodb.net/academics
```

If Compass can't connect, the issue is definitely network-related, not code-related.
