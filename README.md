# Kerala Boat Race Game 🚣‍♂️🏁

This is a 3D multiplayer game inspired by Kerala's traditional boat race. The project uses **Flask** for the backend and **Three.js** for WebGL-based 3D visuals.

> ⚠️ **Note:** This project uses **Git Large File Storage (LFS)** for `.glb` 3D model files. Please follow the instructions below to clone the project properly.

---

## 🚀 Cloning the Repository with Git LFS Support

### ✅ Step 1: Install Git LFS

Git LFS must be installed **before cloning** the repository to download large files like 3D models.

---

### 🪟 For Windows

1. Download and run the Git LFS installer:  
   [https://git-lfs.github.com](https://git-lfs.github.com)

2. After installation, open Git Bash and run:

   ```bash
   git lfs install
   ```

---

### 🍎 For macOS

```bash
brew install git-lfs
git lfs install
```

---

### 🐧 For Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install git-lfs
git lfs install
```

---

## ✅ Step 2: Clone the Repository

```bash
git clone https://github.com/Swasthik-Onewibe/kerala-boat-race-version1.git
cd kerala-boat-race-version1
```

---

## 🔍 Step 3: Verify LFS Files Are Downloaded

```bash
git lfs ls-files
```

You should see:

```
static/models/water_waves.glb
```

---

## 🙌 Done!

Now you're ready to run the project locally. Let me know if you'd like to add Flask setup, game rules, or screenshots!