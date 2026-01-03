---
description: How to set up Firebase for MindSketch
---

# Firebase Setup Guide for MindSketch 🔥

This workflow guides you through setting up Firebase Authentication and Firestore for MindSketch.

## Prerequisites
- A Google account
- Node.js installed

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: `mindsketch` (or your preferred name)
4. Disable Google Analytics (optional for simplicity)
5. Click **Create project**
6. Wait for project to be created, then click **Continue**

## Step 2: Enable Authentication

1. In the Firebase Console sidebar, click **Build** → **Authentication**
2. Click **Get started**
3. Enable the following sign-in providers:

### Email/Password:
- Click **Email/Password**
- Toggle **Enable**
- Click **Save**

### Google:
- Click **Google**
- Toggle **Enable**
- Select your **Project support email**
- Click **Save**

### Anonymous (for Guest mode):
- Click **Anonymous**
- Toggle **Enable**
- Click **Save**

## Step 3: Create Firestore Database

1. In the Firebase Console sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location close to your users
5. Click **Enable**

## Step 4: Get Firebase Configuration

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **"Your apps"** section
4. Click the **Web** icon `</>`
5. Register your app with nickname: `mindsketch-web`
6. **Don't** check "Firebase Hosting" for now
7. Click **Register app**
8. Copy the `firebaseConfig` object values

## Step 5: Create Environment File

// turbo
Create a `.env.local` file in your project root:

```bash
# In the mindsketch folder, create .env.local
```

Add your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Step 6: Set Firestore Security Rules

1. In Firebase Console → **Firestore Database** → **Rules**
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Boards collection
    match /boards/{boardId} {
      // Allow read/write only to the owner
      allow read, write: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
      
      // Allow create if authenticated
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **Publish**

## Step 7: Restart Development Server

// turbo
```bash
npm run dev
```

## Step 8: Test Authentication

1. Open http://localhost:5173
2. Click **Get Started** or **Sign Up**
3. Create an account with email/password
4. Or click **Google** to sign in with Google
5. Or click **Guest Mode** for anonymous access

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure your `.env.local` file has the correct values
- Restart the dev server after adding environment variables

### "Permission denied" when saving
- Check Firestore security rules
- Make sure authentication is working

### Google Sign-In not working
- Verify Google provider is enabled in Firebase Console
- Check that your domain is authorized in Firebase Console → Authentication → Settings → Authorized domains

## Done! 🎉

Your MindSketch app is now connected to Firebase with:
- ✅ Email/Password authentication
- ✅ Google sign-in
- ✅ Guest/Anonymous mode
- ✅ Cloud Firestore database
- ✅ Secure user data isolation
