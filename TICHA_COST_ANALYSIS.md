# TichaAI Cost Analysis & Usage Calculator

**Your Balance**: $9.00  
**Last Updated**: Based on current OpenRouter pricing (2024)

---

## 📊 Complete Processing Flow

Each complete cycle (File Upload → PPT Generation) involves:

1. **File Upload** → No API cost (local storage)
2. **Text Extraction** → No API cost (local processing: pdf-parse, mammoth, etc.)
3. **Text Cleaning** → **OpenRouter API call** (1-3 calls depending on text length)
4. **Outline Generation** → **OpenRouter API call** (1 call)
5. **Image OCR** (if image file) → **OpenRouter Vision API call** (1 call)
6. **PPT Generation** → No API cost (local processing: pptxgenjs)
7. **File Storage** → No API cost (Supabase storage)

---

## 💰 Cost Breakdown Per Cycle

### Scenario 1: **PDF/DOCX/TXT File** (No Image OCR)

#### Step 1: Text Cleaning
- **Models tried** (in order, stops at first success):
  - `qwen/qwen-2-7b-instruct` - ~$0.0001 per 1K tokens
  - `qwen/qwen-2-14b-instruct` - ~$0.0002 per 1K tokens
  - `meta-llama/llama-3.2-3b-instruct` - FREE (if available)
  - `mistralai/mistral-7b-instruct` - ~$0.0001 per 1K tokens
  - `google/gemini-flash-1.5` - ~$0.0001 per 1K tokens

- **Token Usage**:
  - Input: ~500-800 tokens (system prompt + 4000 char text chunk)
  - Output: ~300-600 tokens (cleaned text)
  - **Cost per chunk**: $0.0001 - $0.0003
  - **Number of chunks**: 1-3 chunks (for 3000-9000 char documents)
  - **Total cleaning cost**: $0.0001 - $0.0009

#### Step 2: Outline Generation
- **Models tried** (in order):
  - `qwen/qwen-2-14b-instruct` - ~$0.0002 per 1K tokens
  - `qwen/qwen-2-7b-instruct` - ~$0.0001 per 1K tokens
  - `meta-llama/llama-3.2-11b-instruct` - ~$0.0001 per 1K tokens
  - `mistralai/mistral-7b-instruct` - ~$0.0001 per 1K tokens
  - `google/gemini-flash-1.5` - ~$0.0001 per 1K tokens

- **Token Usage**:
  - Input: ~2000-3000 tokens (system prompt + cleaned text up to 12000 chars)
  - Output: ~1500-2500 tokens (JSON outline with 5-12 slides)
  - **Cost**: $0.0005 - $0.0015

#### **Total Cost per PDF/DOCX/TXT Cycle**: 
- **Minimum** (small file, free model): $0.0006
- **Average** (medium file, cheap model): $0.001 - $0.002
- **Maximum** (large file, premium model): $0.0025

---

### Scenario 2: **Image File** (JPG/PNG/GIF with OCR)

#### Step 1: Image OCR
- **Models tried** (in order):
  - `google/gemini-flash-1.5-8b` - ~$0.0001 per image
  - `google/gemini-flash-1.5` - ~$0.0002 per image
  - `google/gemini-1.5-pro` - ~$0.0005 per image
  - `qwen/qwen-2.5-vl-7b-instruct` - ~$0.0003 per image
  - `qwen/qwen-vl-max` - ~$0.001 per image
  - `anthropic/claude-3-haiku-20240307` - ~$0.0005 per image
  - `anthropic/claude-3-sonnet-20240229` - ~$0.001 per image

- **Token Usage**:
  - Input: ~1000-2000 tokens (image + text prompt)
  - Output: ~500-1500 tokens (extracted text)
  - **Cost**: $0.0001 - $0.0015 (depends on model used)

#### Step 2: Text Cleaning
- Same as Scenario 1: $0.0001 - $0.0009

#### Step 3: Outline Generation
- Same as Scenario 1: $0.0005 - $0.0015

#### **Total Cost per Image Cycle**:
- **Minimum** (cheap vision model): $0.0007
- **Average** (mid-tier model): $0.0015 - $0.0025
- **Maximum** (premium model): $0.004

---

## 🎯 Cost Estimates for $9 Balance

### For PDF/DOCX/TXT Files:
- **Conservative estimate** (average cost): **4,500 - 9,000 cycles**
- **Realistic estimate** (mixed usage): **3,000 - 6,000 cycles**
- **Worst case** (large files, premium models): **1,800 - 3,600 cycles**

### For Image Files:
- **Conservative estimate** (cheap vision model): **3,600 - 6,000 cycles**
- **Realistic estimate** (mid-tier model): **1,800 - 3,600 cycles**
- **Worst case** (premium vision model): **900 - 2,250 cycles**

### Mixed Usage (50% PDF, 50% Images):
- **Realistic estimate**: **2,000 - 4,000 cycles**

---

## 📈 Real-World Testing Scenarios

### Small File (1-2 pages, ~500 words):
- Text cleaning: 1 chunk = $0.0001
- Outline generation: $0.0005
- **Total**: ~$0.0006 per cycle
- **Cycles with $9**: ~**15,000 cycles**

### Medium File (5-10 pages, ~2000 words):
- Text cleaning: 1-2 chunks = $0.0002
- Outline generation: $0.001
- **Total**: ~$0.0012 per cycle
- **Cycles with $9**: ~**7,500 cycles**

### Large File (20+ pages, ~5000 words):
- Text cleaning: 2-3 chunks = $0.0005
- Outline generation: $0.0015
- **Total**: ~$0.002 per cycle
- **Cycles with $9**: ~**4,500 cycles**

### Image with Text (1 page screenshot):
- OCR: $0.0002 (gemini-flash)
- Text cleaning: $0.0001
- Outline generation: $0.0005
- **Total**: ~$0.0008 per cycle
- **Cycles with $9**: ~**11,250 cycles**

---

## ⚠️ Important Notes

1. **Model Fallback Chain**: The system tries cheaper models first, so actual costs are usually on the lower end.

2. **Free Models**: Some models like `meta-llama/llama-3.2-3b-instruct` may be free, which would reduce costs significantly.

3. **Text Chunking**: Large files are split into chunks (3000 chars each). Each chunk requires a separate API call for cleaning.

4. **Token Limits**:
   - Text cleaning: Input limited to 4000 characters per chunk
   - Outline generation: Input limited to 12000 characters
   - Image OCR: Output limited to 2000 tokens

5. **Actual Pricing**: OpenRouter pricing can vary. Check current rates at: https://openrouter.ai/models

6. **Cost Monitoring**: OpenRouter provides usage tracking. Monitor your balance at: https://openrouter.ai/settings/credits

---

## 🧮 Quick Calculator

**For your $9 balance:**

| File Type | File Size | Est. Cost/Cycle | Cycles Available |
|-----------|-----------|-----------------|------------------|
| PDF/DOCX/TXT | Small (1-2 pages) | $0.0006 | ~15,000 |
| PDF/DOCX/TXT | Medium (5-10 pages) | $0.0012 | ~7,500 |
| PDF/DOCX/TXT | Large (20+ pages) | $0.002 | ~4,500 |
| Image | Small (1 page) | $0.0008 | ~11,250 |
| Image | Medium (2-3 pages) | $0.0015 | ~6,000 |
| Image | Large (5+ pages) | $0.003 | ~3,000 |

---

## 💡 Recommendations for Testing

1. **Start with small files** to verify the system works (costs ~$0.0006 each)
2. **Test with different file types** (PDF, DOCX, TXT, Image)
3. **Monitor your balance** after each batch of tests
4. **Use PDF/TXT instead of images** when possible (cheaper)
5. **With $9, you can safely test 100-200 times** even with large files

---

## 🔍 How to Monitor Costs

1. Check OpenRouter dashboard: https://openrouter.ai/activity
2. Look for API calls to:
   - `/chat/completions` (text cleaning & outline generation)
   - Vision models (image OCR)
3. Each API response includes `usage` object with token counts
4. Calculate: `(prompt_tokens * input_price + completion_tokens * output_price)`

---

## ✅ Conclusion

**With $9, you can comfortably test TichaAI:**
- **Minimum**: 1,800 cycles (worst case, large files, premium models)
- **Realistic**: 3,000 - 6,000 cycles (mixed usage)
- **Best case**: 15,000+ cycles (small files, free/cheap models)

**For testing purposes, you should be able to run 100-500 test cycles** without worrying about running out of credits, even with larger files and images.

