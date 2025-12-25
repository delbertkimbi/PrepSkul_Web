# TichaAI Complete Testing Guide

## Implementation Status

All features have been implemented:
- Database schema updates (presentation_data, refinement_history, design_preset, design_customizations)
- Design presets system (5 presets: Corporate, Creative, Minimalist, Academic, Marketing)
- Enhanced AI prompts with preset support
- Iterative refinement API
- Slide editor with PowerPoint-like functionality
- Design learning module (MVP: manual curation, post-MVP: scraping)

## Prerequisites

### 1. Install Dependencies

```bash
pnpm install
```

This will install:
- `zustand` - State management for editor
- `fabric` - Canvas editing library

### 2. Database Setup

Run the updated schema in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/ticha_schema.sql`
3. Run the SQL script
4. Verify new tables are created:
   - `ticha_design_templates`
   - `ticha_design_inspiration`
   - Updated `ticha_presentations` with new columns

### 3. Environment Variables

Ensure `.env.local` has:
```env
OPENROUTER_API_KEY=your_key
NEXT_PUBLIC_TICHA_SUPABASE_URL=your_url
NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY=your_key
TICHA_SUPABASE_SERVICE_KEY=your_key
```

### 4. Supabase Storage Buckets

Create these buckets (if not already created):
- `uploads` (public)
- `generated` (public)

## Testing Workflow

### Test 1: Basic Presentation Generation

1. **Start server:**
   ```bash
   pnpm dev
   ```

2. **Navigate to:** `http://localhost:3000/ticha`

3. **Upload a test file:**
   - Create `test.txt` with content:
     ```
     Introduction to AI
     
     What is AI?
     - Artificial Intelligence
     - Machine Learning
     - Deep Learning
     
     Applications
     - Healthcare
     - Finance
     - Transportation
     
     Conclusion
     - AI is transforming industries
     ```

4. **Upload and generate:**
   - Upload the file
   - Wait for processing (30-60 seconds)
   - Verify download button appears
   - Download and open the PowerPoint

**Expected Result:** PowerPoint with 5-8 slides, professional design

---

### Test 2: Design Presets

1. **Generate with preset:**
   - Upload a file
   - In the prompt field, add: "Use corporate design style"
   - Generate presentation
   - Verify blue/gray color scheme

2. **Test different presets:**
   - Try: "Use creative design" (should be colorful)
   - Try: "Use minimalist design" (should be clean, simple)
   - Try: "Use academic design" (should be formal)

**Expected Result:** Different color schemes and layouts based on preset

---

### Test 3: Iterative Refinement

1. **Generate initial presentation:**
   - Upload a file and generate
   - Note the `presentationId` (check browser console or network tab)

2. **Refine the presentation:**
   - Click "Refine Presentation" button
   - Enter refinement prompt: "Make it more colorful and add 2 more slides"
   - Select a preset (e.g., "Creative")
   - Click "Refine"
   - Wait for processing

3. **Verify refinement:**
   - New download URL should appear
   - Download and compare with original
   - Check that changes were applied

**Expected Result:** Refined presentation with requested changes

---

### Test 4: Slide Editor

1. **Open editor:**
   - After generating a presentation
   - Click "Edit in Editor" button
   - Should navigate to `/ticha/editor/[id]`

2. **Test editor features:**
   - **Navigation:** Click slide thumbnails to switch slides
   - **Text editing:** Click on text elements to edit
   - **Properties:** Select text, change font, size, color in properties panel
   - **Formatting:** Use toolbar buttons (Bold, Italic, Align)
   - **Add slide:** Click + button in thumbnails
   - **Remove slide:** Click trash icon (if more than 1 slide)
   - **Undo/Redo:** Test undo and redo buttons
   - **Save:** Click Save button

3. **Verify editor state:**
   - Changes should persist
   - Undo/redo should work
   - Properties panel should update when selecting elements

**Expected Result:** Full editing functionality like PowerPoint

---

### Test 5: Design Preset Selector

1. **Open refinement modal:**
   - After generating a presentation
   - Click "Refine Presentation"
   - Scroll to "Design Preset" section

2. **Test preset selection:**
   - Click on different preset cards
   - Verify visual preview (color swatches)
   - Select a preset and refine
   - Verify preset is applied

**Expected Result:** Visual preset selector with previews

---

### Test 6: Custom Design Prompts

1. **Generate with custom design:**
   - Upload file
   - In prompt: "Make it blue and white, use large fonts, add more spacing"
   - Generate

2. **Verify custom design:**
   - Check PowerPoint colors match request
   - Verify font sizes are larger
   - Check spacing is increased

**Expected Result:** Custom design requirements are applied

---

### Test 7: Refinement History

1. **Generate and refine multiple times:**
   - Generate initial presentation
   - Refine once: "Add more slides"
   - Refine again: "Change to corporate style"
   - Refine third time: "Make it more colorful"

2. **Check history:**
   - Each refinement should create a new version
   - Version numbers should increment
   - Each refinement should have its own download URL

**Expected Result:** Multiple refinement iterations tracked

---

## API Testing

### Test Refinement API Directly

```bash
curl -X POST http://localhost:3000/api/ticha/refine \
  -H "Content-Type: application/json" \
  -d '{
    "presentationId": "your-presentation-id",
    "refinementPrompt": "Make it more colorful",
    "designPreset": "creative",
    "customDesignPrompt": "Use blue and purple colors"
  }'
```

### Test Editor Save API

```bash
curl -X POST http://localhost:3000/api/ticha/editor/save \
  -H "Content-Type: application/json" \
  -d '{
    "presentationId": "your-presentation-id",
    "presentationData": { ... },
    "changes": {
      "description": "Manual edit",
      "type": "content"
    }
  }'
```

### Test Design Learning API

```bash
curl -X POST http://localhost:3000/api/ticha/design/learn \
  -H "Content-Type: application/json" \
  -d '{
    "sources": ["behance", "dribbble"],
    "categories": ["corporate", "creative"]
  }'
```

---

## Common Issues & Solutions

### Issue: "Presentation not found" in editor
**Solution:** Make sure you're generating presentations with a logged-in user (presentationId is required)

### Issue: Fabric.js not loading
**Solution:** 
- Check browser console for errors
- Ensure `fabric` package is installed: `pnpm install fabric`
- Editor will fall back to basic rendering if Fabric.js fails

### Issue: Refinement not working
**Solution:**
- Check OpenRouter credits are available
- Verify `presentationId` is valid
- Check browser console for API errors

### Issue: Design presets not applying
**Solution:**
- Verify preset names match exactly: "corporate", "creative", "minimalist", "academic", "marketing"
- Check AI prompt includes preset guidance (check console logs)

### Issue: Editor state not persisting
**Solution:**
- Click Save button after making changes
- Check browser console for save errors
- Verify database connection

---

## Feature Checklist

- [x] Database schema updated
- [x] Design presets system
- [x] Enhanced AI prompts
- [x] Refinement API
- [x] Editor state management
- [x] Slide canvas component
- [x] Properties panel
- [x] Editor toolbar
- [x] Slide thumbnails
- [x] Editor page
- [x] Refinement UI
- [x] Preset selector
- [x] Design learning module
- [x] Editor save API

---

## Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Enhance editor features** based on feedback
3. **Implement full PPTX parsing** for better editor support
4. **Add image upload** to editor
5. **Implement design scraping** (post-MVP)
6. **Add more design presets** if needed

---

## Quick Test Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Check for linting errors
pnpm lint
```

---

**Ready to test!** Start with Test 1 and work through each test systematically.

