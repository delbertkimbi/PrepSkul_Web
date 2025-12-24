# TichaAI: Using pnpm (Not npm)

## ✅ You're Right - This Project Uses pnpm!

Your project has:
- ✅ `pnpm-lock.yaml` - pnpm lockfile
- ✅ `pnpm-workspace.yaml` - pnpm workspace config

**This means you should use `pnpm`, not `npm`!**

---

## 🚀 Quick Setup with pnpm

### Step 1: Install pnpm (if not installed)

**Windows (PowerShell):**
```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

**Mac/Linux:**
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**Or via npm (if you have npm):**
```bash
npm install -g pnpm
```

**Verify installation:**
```bash
pnpm --version
```

---

### Step 2: Install Dependencies with pnpm

**Cancel any running npm install** (Ctrl+C) and run:

```bash
pnpm install
```

This will:
- ✅ Read from `pnpm-lock.yaml`
- ✅ Install all dependencies (including the new ones we added)
- ✅ Be much faster than npm
- ✅ Handle peer dependencies correctly

---

### Step 3: Install New Dependencies

After initial install, add the TichaAI backend dependencies:

```bash
pnpm add pptxgenjs pdf-parse docx mammoth tesseract.js sharp
```

This should be **much faster** than npm!

---

## 📊 Why pnpm is Better Here

1. **Faster**: Uses content-addressable storage
2. **Efficient**: Saves disk space (hard links instead of copying)
3. **Correct**: Matches your project configuration
4. **Better peer deps**: Handles dependencies better

---

## 🔄 If You Already Ran npm install

If you already ran `npm install`, you might have conflicts:

### Option 1: Clean and Reinstall (Recommended)
```bash
# Remove node_modules and lock files
rm -rf node_modules
rm -f package-lock.json  # Remove npm lock if exists

# Install with pnpm
pnpm install

# Add new dependencies
pnpm add pptxgenjs pdf-parse docx mammoth tesseract.js sharp
```

### Option 2: Just Switch to pnpm
```bash
# pnpm will use its own lockfile and ignore npm's
pnpm install

# Add new dependencies
pnpm add pptxgenjs pdf-parse docx mammoth tesseract.js sharp
```

---

## ✅ Verify Installation

After installation, verify:

```bash
# Check if dependencies are installed
ls node_modules/pptxgenjs
ls node_modules/pdf-parse
ls node_modules/mammoth

# Check pnpm version
pnpm --version

# List installed packages
pnpm list --depth=0
```

---

## 🚀 Running the Project

With pnpm, use:

```bash
# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start

# Lint
pnpm lint
```

---

## 💡 Why npm Was Slow

1. **Wrong package manager**: Project is configured for pnpm
2. **Missing lockfile**: npm had to resolve dependencies from scratch
3. **Inefficient storage**: npm copies files, pnpm uses hard links
4. **Peer dependency conflicts**: npm struggled with React 19 peer deps

**pnpm will handle all of this correctly!**

---

## 📝 Quick Commands Reference

```bash
# Install all dependencies
pnpm install

# Add a dependency
pnpm add package-name

# Add a dev dependency
pnpm add -D package-name

# Remove a dependency
pnpm remove package-name

# Update dependencies
pnpm update

# Check outdated packages
pnpm outdated
```

---

## 🎯 Next Steps

1. ✅ **Install pnpm** (if not installed)
2. ✅ **Run `pnpm install`** to install all dependencies
3. ✅ **Add TichaAI dependencies**: `pnpm add pptxgenjs pdf-parse docx mammoth tesseract.js sharp`
4. ✅ **Test the API** - everything should work now!

---

**Bottom line**: Use `pnpm` instead of `npm` - it's what your project is configured for, and it will be much faster! 🚀

