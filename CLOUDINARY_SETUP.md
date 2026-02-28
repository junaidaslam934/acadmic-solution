# Cloudinary Setup Instructions

## Step 1: Create Unsigned Upload Preset

1. Go to your Cloudinary Dashboard: https://cloudinary.com/console
2. Click on **Settings** (gear icon) in the top right
3. Go to the **Upload** tab
4. Scroll down to **Upload presets** section
5. Click **Add upload preset** button
6. Configure the preset:
   - **Preset name**: `portfolio_unsigned`
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: `portfolio` (optional but recommended)
   - **Use filename**: Yes (optional)
   - **Unique filename**: Yes (recommended)
7. Click **Save**

## Step 2: Verify Your Cloud Name

Your cloud name is: `dy3xqdkjw`

Make sure this matches your actual Cloudinary cloud name.

## Step 3: Test Upload

1. Go to http://localhost:3000/admin
2. Login with password: `12345678`
3. Try uploading a video and screenshots
4. Files will upload directly to Cloudinary

## Troubleshooting

If you get an error:
- Make sure the upload preset name is exactly `portfolio_unsigned`
- Make sure "Signing Mode" is set to "Unsigned"
- Check that your cloud name is correct
- Try refreshing the page and uploading again

## Current Configuration

- Cloud Name: `dy3xqdkjw`
- Upload Preset: `portfolio_unsigned`
- Max Video Size: 700MB
- Max Screenshots: 3 images
