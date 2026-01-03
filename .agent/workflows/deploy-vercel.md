---
description: How to deploy MindSketch to Vercel
---

# Deploy MindSketch to Vercel 🚀

This workflow guides you through deploying MindSketch to Vercel for free.

## Prerequisites
- MindSketch project with Firebase configured
- GitHub account
- Vercel account (free)

## Step 1: Prepare for Production

// turbo
Make sure your project builds successfully:

```bash
npm run build
```

## Step 2: Initialize Git Repository (if not done)

// turbo
```bash
git init
git add .
git commit -m "Initial commit - MindSketch"
```

## Step 3: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon → **New repository**
3. Name: `mindsketch`
4. Keep it **Public** or **Private**
5. Don't initialize with README (we already have one)
6. Click **Create repository**

## Step 4: Push to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/mindsketch.git
git branch -M main
git push -u origin main
```

## Step 5: Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and sign up/login with GitHub
2. Click **Add New...** → **Project**
3. Find and **Import** your `mindsketch` repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## Step 6: Add Environment Variables

Before clicking Deploy, expand **Environment Variables** and add:

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID |

## Step 7: Deploy

1. Click **Deploy**
2. Wait for deployment to complete (usually 1-2 minutes)
3. Click on the deployed URL to view your live app!

## Step 8: Update Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Authentication** → **Settings** → **Authorized domains**
3. Click **Add domain**
4. Add your Vercel domain (e.g., `mindsketch.vercel.app`)
5. Also add any custom domains if you have them

## Step 9: Test Production

1. Open your Vercel URL
2. Test sign up with email/password
3. Test Google sign-in
4. Create a sketchboard and add some nodes
5. Sign out and sign back in to verify data persistence

## Automatic Deployments

After initial setup, Vercel will automatically redeploy whenever you push changes to the `main` branch:

```bash
git add .
git commit -m "Your changes"
git push
```

## Custom Domain (Optional)

1. In Vercel, go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Don't forget to add the custom domain to Firebase authorized domains

## Troubleshooting

### Build fails
- Check build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- Test `npm run build` locally first

### Firebase auth not working
- Verify environment variables are set in Vercel
- Check authorized domains in Firebase Console
- Redeploy after adding environment variables

### Page not found on refresh
- Vite/React Router should handle this automatically
- If issues persist, add a `vercel.json` with rewrites

## Done! 🎉

Your MindSketch is now live at your Vercel URL!

**Your app includes:**
- ✅ Free hosting on Vercel
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from Git
- ✅ Free custom domain support
