# B-MAD (Brain-Machine Augmented Defense)

B-MAD is an immersive WebAR Tower Defense game where the player's own face becomes the battlefield. Defend your vital organs (Eyes, Nose, Mouth) from waves of neural intruders using strategic tower placement and resource management.

## 🚀 Features

- **WebAR Face Tracking:** Powered by MindAR and Three.js for a seamless augmented reality experience in the browser.
- **Realistic Head Occlusion:** Advanced 3D head modeling ensures enemies and towers are properly masked when moving behind the user's head.
- **Strategic Tower Defense:**
    - Three tower types (Green, Red, Blue) with unique stats.
    - Automatic targeting and projectile systems.
    - Landmark-snapping placement system.
- **Dynamic Wave System:** Face off against Crawlers, Tanks, and Flyers with progressive difficulty.
- **Visual Feedback & Immersion:**
    - Progressive vision deterioration (vignette/blur) as your "Eyes" organ takes damage.
    - Cyberpunk-themed HUD and real-time status messages.
    - Synth-based audio feedback.
- **Mobile Optimized:** Designed for high performance (60 FPS) on modern mobile devices.

## 🛠️ Tech Stack

- **Framework:** [Vite](https://vitejs.dev/)
- **3D Engine:** [Three.js (v0.160.0)](https://threejs.org/)
- **AR Library:** [MindAR](https://github.com/hiukim/mind-ar-js)
- **Development:** ES Modules (ESM), @vitejs/plugin-basic-ssl (for HTTPS)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd b-mad
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   *Note: AR requires camera access. The dev server uses HTTPS to enable camera permissions in the browser.*

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🎮 How to Play

1. **Grant Camera Permissions:** Allow the browser to access your camera when prompted.
2. **Face the Camera:** Ensure your face is well-lit and clearly visible.
3. **Select a Tower:** Use the bottom menu to select between Green (Basic), Red (Heavy), or Blue (Rapid) towers.
4. **Place Towers:** Tap/Click on strategic points on your face (cheeks, forehead, nose) to deploy defenses.
5. **Defend:** Stop the neural intruders before they reach your Eyes, Nose, or Mouth.
6. **Watch your Health:** If your Eyes take damage, your vision will start to fail!

## 📂 Project Structure

```
src/
├── core/               # Main game logic & data models (GameManager, Enemy, Tower, etc.)
├── systems/            # ECS-like systems (EnemySystem, TowerSystem, HealthSystem, etc.)
├── utils/              # Configuration and math helpers
├── main.js             # Application entry point
public/
├── assets/             # 3D models and audio assets
└── mind/               # MindAR model files
```

## 📜 License

This project is licensed under the ISC License.

---
**Developed for the B-MAD neural defense initiative.**
