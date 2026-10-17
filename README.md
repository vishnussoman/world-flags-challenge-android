# World Flags Challenge — Android Application

**World Flags Challenge** is an educational, fast-paced standalone Android flag quiz and learning game covering **all 196 sovereign nations** of the world across 5 continents. Built with React 19, TypeScript, Tailwind CSS, and powered by **Capacitor 7** for native Android deployment.

---

## 📱 Features

- **All 196 Sovereign Nations**: Complete global coverage with official vector SVG flags, capitals, populations, and vexillological symbolism facts.
- **Three Engaging Game Modes**:
  - **Classic Quiz**: 15-question trivia battle with speed multipliers.
  - **60s Blitz Rush**: Rapid-fire clock attack with streak time bonuses.
  - **Streak Survival**: 3 lives sudden death endurance mode.
- **Interactive Flag Atlas & 3D Flashcards**: Search and study every nation, flip flashcards to test memory, and launch targeted flag practice.
- **Native Android Optimizations**:
  - **Capacitor Haptics**: Tactile feedback on clicks, correct chimes, and mistakes.
  - **Hardware Back Button**: Custom Android navigation logic preventing accidental app exits.
  - **Edge-to-Edge Display**: Safe area insets supporting modern Android notches and navigation bars.
  - **Immersive Dark Palette**: AMOLED-friendly `#020617` background with portrait lock.

---

## 🛠️ Prerequisites

To build and run this Android project, your development machine requires:

1. **Node.js**: v18.x or v20.x+ and **npm** v9+
2. **Java Development Kit (JDK)**: JDK 17 or JDK 21 (required by Gradle 8.x)
3. **Android Studio**: Android Studio Ladybug (2024.2+) or newer with:
   - Android SDK Platform 34 or 35
   - Android SDK Build-Tools (34.0.0 or 35.0.0)
   - Android SDK Command-line Tools
   - Android Emulator (or an Android device with USB Debugging enabled)

*Note: Compiling the final Android APK (`.apk`) or Android App Bundle (`.aab`) requires the Android SDK and Gradle toolchain, which must be executed on a computer or CI/CD environment with Android Studio/SDK installed.*

---

## 🚀 Quick Start & Web Development

1. Navigate into the `world-flags-challenge-android` directory:
   ```bash
   cd world-flags-challenge-android
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Launch the local web preview server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🤖 Preparing the Android Project

### Step 1: Build Web Assets
Compile the React/TypeScript codebase into the production `dist/` directory:
```bash
npm run build
```

### Step 2: Synchronize with Android
Synchronize the web build and native Capacitor plugins into the `android/` project:
```bash
npx cap sync android
```
*(Or use the combined shortcut: `npm run build:android`)*

---

## 📦 Building the Android APK

### Option A: Build a Debug APK via Terminal (Command Line)

If you have `ANDROID_HOME` configured in your shell environment:

On Linux / macOS:
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

On Windows (PowerShell or Command Prompt):
```bash
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

**Output APK Location:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Install onto your connected Android device:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Option B: Build via Android Studio (Recommended GUI)

1. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
   *(Or launch Android Studio and choose **Open an Existing Project**, selecting the `world-flags-challenge-android/android` directory).*

2. Wait for Gradle sync to complete.

3. **To Run on Device or Emulator**:
   - Select your target device/emulator from the device dropdown.
   - Click the green **Run (Play)** button or press `Shift + F10`.

4. **To Build a Debug APK**:
   - In the top menu, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Once finished, click the **locate** popup link to find `app-debug.apk`.

---

## 🔐 Generating a Signed Release APK / AAB (For Google Play Store)

To distribute World Flags Challenge on the Google Play Store:

### 1. Generate a Keystore (One-Time Setup)
Run `keytool` from your terminal (included with the JDK):
```bash
keytool -genkey -v -keystore world-flags-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias world-flags-challenge
```
*Keep your `.jks` file and passwords safe and never commit them to public version control.*

### 2. Generate Signed Bundle/APK in Android Studio
1. Open the project in Android Studio: `npx cap open android`
2. Go to **Build** > **Generate Signed Bundle / APK...**
3. Choose:
   - **Android App Bundle (.aab)** for Google Play Store upload.
   - **APK (.apk)** for direct sideloading.
4. Click **Next**, choose your `world-flags-release-key.jks` file, and enter your passwords and alias.
5. Select **release** build variant and check **V1 (Jar Signature)** & **V2 (Full APK Signature)**.
6. Click **Finish**.

**Output Location:**
```
android/app/release/app-release.aab (or app-release.apk)
```

---

## 📂 Project Structure

```
world-flags-challenge-android/
├── android/                         # Native Android project scaffold
│   ├── app/
│   │   ├── build.gradle             # App Gradle config (namespace: com.worldflagschallenge.app)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml  # Manifest with portrait lock, hardware acceleration
│   │       ├── java/                # MainActivity.java Capacitor Bridge
│   │       └── res/                 # App strings, themes, and resources
│   ├── build.gradle                 # Root Gradle build script
│   ├── settings.gradle              # Subproject Gradle declarations
│   └── variables.gradle             # SDK versions (compileSdk: 35, minSdk: 22)
├── src/
│   ├── components/                  # UI components (FlagSvg, HUD, Modals, Atlas, Title)
│   ├── data/countries.ts            # All 196 sovereign nations database
│   ├── types/flags.ts               # TypeScript models
│   ├── utils/audio.ts               # Web Audio synth + Capacitor Haptics
│   ├── App.tsx                      # Game coordinator with Android BackButton listener
│   ├── main.tsx                     # Entry point with Status Bar setup
│   └── index.css                    # Tailwind CSS + safe-area insets
├── capacitor.config.ts              # Capacitor 7 configuration (appId: com.worldflagschallenge.app)
├── package.json                     # Scripts and dependencies
├── vite.config.ts                   # Vite bundler configuration
└── README.md                        # Documentation
```

---

## 🌐 Pushing to a Separate GitHub Repository

This folder is completely independent of the original web project. To push it to its own GitHub repository:

```bash
cd world-flags-challenge-android
git init
git add .
git commit -m "Initial commit: World Flags Challenge Android Capacitor app"
git branch -M main
git remote add origin https://github.com/<your-username>/world-flags-challenge.git
git push -u origin main
```
