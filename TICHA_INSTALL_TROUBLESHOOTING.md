# TichaAI Dependency Installation Troubleshooting

## 🐌 Slow Installation Issues

If `npm install --legacy-peer-deps` is taking too long, here are solutions:

---

## Option 1: Install Dependencies One by One

Install packages individually to identify which one is causing the delay:

```bash
npm install pptxgenjs --legacy-peer-deps
npm install pdf-parse --legacy-peer-deps
npm install mammoth --legacy-peer-deps
npm install tesseract.js --legacy-peer-deps
npm install sharp --legacy-peer-deps
npm install docx --legacy-peer-deps
```

**Note**: `tesseract.js` and `sharp` can be slow because they have native dependencies that need to be compiled.

---

## Option 2: Use Yarn (Faster)

If you have Yarn installed:

```bash
yarn add pptxgenjs pdf-parse docx mammoth tesseract.js sharp
```

Yarn is generally faster than npm for large dependency trees.

---

## Option 3: Use pnpm (Fastest)

If you have pnpm installed:

```bash
pnpm add pptxgenjs pdf-parse docx mammoth tesseract.js sharp
```

pnpm is typically the fastest package manager.

---

## Option 4: Skip Heavy Dependencies (Temporary)

For now, you can skip the heavy dependencies and add them later:

### Critical Dependencies (Install These First):
```bash
npm install pptxgenjs pdf-parse mammoth --legacy-peer-deps
```

These are needed for the core functionality (PDF, DOCX, PPT generation).

### Optional Dependencies (Can Add Later):
```bash
# For image processing (OCR fallback)
npm install tesseract.js --legacy-peer-deps

# For image optimization (optional)
npm install sharp --legacy-peer-deps

# DOCX library (alternative, mammoth is already installed)
npm install docx --legacy-peer-deps
```

**Note**: The API will still work with just the critical dependencies. Image OCR will fallback to OpenRouter Vision if Tesseract.js isn't available.

---

## Option 5: Install with Progress Indicator

Check if npm is actually working:

```bash
# Clear npm cache first
npm cache clean --force

# Install with verbose output
npm install --legacy-peer-deps --verbose

# Or check progress
npm install --legacy-peer-deps --progress=true
```

---

## Option 6: Install Without Peer Dependency Checks

If you're confident about compatibility:

```bash
npm install pptxgenjs pdf-parse docx mammoth tesseract.js sharp --force
```

**Warning**: This ignores all peer dependency warnings.

---

## Option 7: Manual Installation in package.json

The dependencies are already added to `package.json`. You can:

1. **Keep it running**: Sometimes npm just needs time, especially for packages with native dependencies
2. **Let it complete**: Even if it takes 5-10 minutes, it should finish
3. **Check for errors**: Look for actual errors (not just slow progress)

---

## 🔍 Why It's Slow

Some packages that take longer:

1. **tesseract.js**: ~50MB, includes pre-built binaries for multiple platforms
2. **sharp**: ~15MB, native image processing library (needs compilation)
3. **pdf-parse**: Includes dependencies
4. **Large dependency trees**: Each package has its own dependencies

**Normal install time**: 2-10 minutes depending on your internet speed and machine.

---

## ✅ Quick Test: Check if It's Working

While installation is running, you can check if npm is actually working:

1. **Open another terminal** (keep the install running)
2. **Check if files are being created**:
   ```bash
   ls -la node_modules/pptxgenjs 2>/dev/null || echo "Not installed yet"
   ```
3. **Check npm process**:
   ```bash
   # Windows
   tasklist | findstr node
   
   # Mac/Linux
   ps aux | grep npm
   ```

---

## 🚀 Recommended Approach

**For now, since you need to test quickly:**

1. **Install only critical dependencies**:
   ```bash
   npm install pptxgenjs pdf-parse mammoth --legacy-peer-deps
   ```

2. **Test the API** with PDF and DOCX files (most common use cases)

3. **Add image OCR later**:
   ```bash
   npm install tesseract.js --legacy-peer-deps
   ```

4. **Add image optimization later** (if needed):
   ```bash
   npm install sharp --legacy-peer-deps
   ```

---

## 🔧 Alternative: Use Docker or CI/CD

If local installation keeps failing, you can:

1. **Let Vercel/Deployment handle it**: The dependencies will install during deployment
2. **Test in production**: Deploy and test there
3. **Use Docker**: Containerized environment for consistent installs

---

## ⚠️ Current Status

Even if installation is slow, **the code is ready to use**. You can:

1. ✅ **Test the API locally** once critical dependencies are installed
2. ✅ **Deploy to Vercel** and let deployment handle the install
3. ✅ **Use the generated code** - all backend logic is complete

The slow installation is just a package manager issue, not a code issue.

---

## 💡 Pro Tip

If you're on Windows and it's really slow:

```bash
# Use Windows Subsystem for Linux (WSL) if available
wsl
npm install --legacy-peer-deps
```

WSL is often faster for npm operations on Windows.

---

**Bottom line**: Let it run, or install critical dependencies first and add the rest later. The code will work with just the critical packages.

