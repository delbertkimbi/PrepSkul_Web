# TichaAI Testing Quick Start Guide

## 🚀 Quick Start

### 1. Install Test Dependencies

```bash
pnpm install
```

This will install Jest, ts-jest, and all required testing dependencies.

### 2. Run All Tests

```bash
pnpm test
```

### 3. Run Tests in Watch Mode (for development)

```bash
pnpm test:watch
```

### 4. Run Tests with Coverage Report

```bash
pnpm test:coverage
```

---

## 📋 What's Tested

### ✅ Core Components

1. **Text Extraction**
   - Plain text files (TXT)
   - PDF files (mocked)
   - DOCX files (mocked)
   - File type detection

2. **OpenRouter Integration** (mocked)
   - Text cleaning
   - Outline generation
   - Text chunking
   - Model fallback chain

3. **PowerPoint Generation**
   - Basic PPT creation
   - All layout types (5 layouts)
   - All color themes (5 themes)
   - All icon types (5 icons)
   - Edge cases

4. **Integration Tests**
   - Complete pipeline (File → Extract → Clean → Outline → PPT)
   - Large file handling
   - Error handling

---

## 🧪 Test Structure

```
__tests__/
├── ticha/
│   ├── extract/
│   │   ├── extractText.test.ts      # Text extraction
│   │   ├── extractPdf.test.ts       # PDF extraction
│   │   ├── extractDocx.test.ts      # DOCX extraction
│   │   └── fileDetection.test.ts     # File type detection
│   ├── openrouter.test.ts            # OpenRouter API (mocked)
│   ├── ppt/
│   │   └── createPPT.test.ts         # PowerPoint generation
│   └── integration.test.ts           # End-to-end tests
```

---

## 🔍 Running Specific Tests

### Run a Single Test File

```bash
pnpm test extractText.test.ts
```

### Run Tests Matching a Pattern

```bash
pnpm test extract
```

### Run Tests in a Directory

```bash
pnpm test __tests__/ticha/extract
```

---

## 📊 Understanding Test Output

### Successful Test Run

```
PASS  __tests__/ticha/extract/extractText.test.ts
  extractText
    ✓ should extract text from UTF-8 buffer (5 ms)
    ✓ should handle empty text files (2 ms)
    ✓ should handle special characters and unicode (3 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

### Failed Test

```
FAIL  __tests__/ticha/extract/extractText.test.ts
  extractText
    ✓ should extract text from UTF-8 buffer (5 ms)
    ✕ should handle empty text files (2 ms)

  ● extractText › should handle empty text files

    expect(received).toBe(expected)

    Expected: ""
    Received: "something"

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
```

---

## 🛠️ Troubleshooting

### Issue: "Cannot find module '@/lib/ticha/...'"

**Solution**: Check that `jest.config.js` has the correct `moduleNameMapper`:
```js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Issue: "TypeError: Cannot read property 'mock' of undefined"

**Solution**: Make sure you're mocking modules before importing:
```typescript
jest.mock('module-name')
import { functionName } from 'module-name'
```

### Issue: Tests timeout

**Solution**: Increase timeout in `jest.config.js`:
```js
testTimeout: 30000, // 30 seconds
```

### Issue: "OPENROUTER_API_KEY is not defined"

**Solution**: Tests use mock environment variables from `jest.setup.js`. If you see this error, check that `jest.setup.js` is properly configured.

---

## 📝 Writing Your Own Tests

### Example: Testing a New Function

```typescript
import { myFunction } from '@/lib/ticha/myModule'

describe('myFunction', () => {
  it('should do something', async () => {
    // Arrange
    const input = 'test input'
    
    // Act
    const result = await myFunction(input)
    
    // Assert
    expect(result).toBe('expected output')
  })
})
```

### Example: Mocking External APIs

```typescript
// Mock fetch
global.fetch = jest.fn()

// Mock successful response
;(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'mock data' }),
})

// Test your function
const result = await myFunction()
expect(result).toBe('expected')
```

---

## 🎯 Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All critical paths
- **Edge Cases**: Empty inputs, large files, errors

---

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] All tests pass (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] New code has tests
- [ ] Tests are meaningful (not just checking if function exists)

---

## 🚀 Next Steps

1. **Run the tests**: `pnpm test`
2. **Check coverage**: `pnpm test:coverage`
3. **Fix any failing tests**
4. **Add tests for new features**

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- See `__tests__/README.md` for detailed documentation

---

**Happy Testing! 🎉**

