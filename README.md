# MindSketch 🎨

A creative visual thinking and brainstorming tool with an infinite interactive canvas. MindSketch allows you to capture ideas, thoughts, study notes, and project plans — like sketching in a physical notebook, but infinitely better.

![MindSketch Preview](https://via.placeholder.com/800x400?text=MindSketch+Preview)

## ✨ Features

- **Infinite Canvas** - Unlimited space for your ideas with zoom and pan
- **Sticky Notes** - Add colorful sticky notes to capture thoughts
- **Text Notes** - Add text nodes anywhere on the canvas
- **Connect Ideas** - Draw pencil-style connections between nodes
- **Hand-Drawn Aesthetic** - Beautiful doodle/sketch UI design
- **Cloud Sync** - Auto-save and sync across devices
- **Multi-User** - Each user has their own private workspace
- **Responsive** - Works on mobile, tablet, and desktop

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- A Firebase project (free tier)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mindsketch.git
   cd mindsketch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable **Authentication** (Email/Password and Google)
   - Enable **Firestore Database**
   - Get your Firebase config from Project Settings

4. Configure environment:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase credentials in `.env.local`

5. Set up Firestore Rules (in Firebase Console):
   ```js
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /boards/{boardId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null;
       }
     }
   }
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🎨 Design Philosophy

MindSketch features a unique **hand-drawn doodle aesthetic**:
- Off-white notebook paper background
- Handwritten fonts (Gloria Hallelujah, Patrick Hand, Indie Flower)
- Sketchy borders and organic imperfections
- Playful animations and micro-interactions
- Sticky note-style cards and popups

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Custom CSS with doodle aesthetics
- **Authentication**: Firebase Auth (Email, Google, Anonymous)
- **Database**: Firebase Firestore
- **Hosting**: Vercel / Firebase Hosting / Netlify (free tier)

## 📱 Responsive Design

- **Mobile**: Bottom toolbar, touch-friendly canvas
- **Tablet**: Optimized layout with floating panels
- **Desktop**: Full toolbar, hover interactions, keyboard shortcuts

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected node |
| `Escape` | Deselect / Cancel |
| `Ctrl + S` | Save board |
| `Ctrl + 0` | Reset viewport |
| `Shift + Drag` | Pan canvas |
| `Scroll` | Zoom in/out |

## 📁 Project Structure

```
mindsketch/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── CanvasNode.jsx
│   │   │   ├── CanvasConnection.jsx
│   │   │   └── CanvasToolbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── SketchboardContext.jsx
│   ├── pages/
│   │   ├── Auth/
│   │   ├── Canvas/
│   │   ├── Dashboard/
│   │   └── Landing/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
└── package.json
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Made with ✏️ and ❤️ | Think. Sketch. Create.
