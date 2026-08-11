# happy# Birthday Universe 🌌

An emotionally engaging, premium birthday web application that creates an unforgettable, cinematic birthday journey.

Developed with **React**, **TypeScript**, and **CSS Variables** (for fluid transitions and rich theme customization). The application is fully client-side, using **IndexedDB** for fast and zero-config media and data storage.

---

## 🚀 How to Run Locally

## 🌐 Deploy to the real world

This app can be deployed as a standard Node.js web app.

### Recommended hosting
- Render
- Railway

Use the Node server deployment above for public links. A static-only Vercel deployment cannot store a generated universe for another person's phone to retrieve, so it will lead to the “Universe Displaced” screen. After deployment, create a new link; links made before the public save succeeded cannot be recovered.

### Deployment steps
1. Push the project to GitHub.
2. Create a new Web Service on Render or Railway.
3. Use these values:
   - Build command: npm install && npm run build
   - Start command: npm start
4. After deployment, open the public URL and generate a birthday universe.

### Password protection
Set a password in the final step before generating the public link. The birthday person will need that password to open the experience.

### Deployment config
A deployment config file is included at [render.yaml](render.yaml).


### 1. Extract the Project
Extract the zip file to your local workspace directory.

### 2. Install Dependencies
Open your terminal in the extracted folder and run:
```bash
npm install
```

### 3. Run Development Server
Start the local server by running:
```bash
npm run dev
```
The terminal will display a local link (typically `http://localhost:5173`). Open this link in your browser!

---

## 🎨 Key Features & Architecture

### 1. Creator Dashboard (Private Mode)
- **Wizard Stepper**: Walk through details, upload photos, pick theme visual styles, customize the birthday cake, and generate the final link.
- **Media Upload Manager**: Upload up to 100 images, drag and drop to rearrange slideshow ordering, write captions, dates, and memory logs. Supporting background audio track (MP3) and voice narrative narration.
- **Custom Cake Configurator**: Design your cake tier frosting flavor (Strawberry, Double Chocolate, Rainbow, Elegant Gold), adjust candle counts, set custom frosting text, and pick candle colors.
- **AI Slideshow Maker**: HTML5 Canvas rendering engine with Ken Burns zooms and cross-fades that blends images with background audio and exports as an MP4/WebM video client-side!
- **Saves to Local Database**: Writes configurations and media to the local IndexedDB database, allowing you to load previous creations, make edits, or delete them.

### 2. Birthday Experience (Public Link Mode)
Opening the generated URL hash (e.g. `#/universe/XYZ123`) loads the magical cinematic journey for the recipient:
- **Magical Entrance (Page 1)**: Moving stars portal welcoming the user, with custom language selector (Tamil, English, Hindi, Telugu, Malayalam, Kannada, Bengali).
- **Memory World (Page 2)**: Beautiful floating glassmorphic Polaroid frames rendering uploaded memories sequentially with active background music controls.
- **Cake Celebration (Page 3)**: Interactive digital cake. Tapping or blowing into your microphone (utilizing Web Audio API analyzer) extinguishes candles, triggers canvas-based confetti and fireworks particle bursts, and plays a retro synthesized birthday chiptune melody.
- **Birthday Video (Page 4)**: Plays the customized generated slideshow video with standard fullscreen playback controls.
- **Final wishes & Reply (Page 5)**: Emotional cards showing the sender's final message, feedback star rating, and direct quick-reply actions (WhatsApp text reply, direct phone call). Displays the recipient's name written in glittering constellations against the dark sky!
