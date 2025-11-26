# TichaAI Test Suite

This directory contains comprehensive unit and integration tests for TichaAI.

## Test Structure

```
__tests__/
├── ticha/
│   ├── extract/
│   │   ├── extractText.test.ts      # Text file extraction tests
│   │   ├── extractPdf.test.ts       # PDF extraction tests
│   │   ├── extractDocx.test.ts      # DOCX extraction tests
│   │   └── fileDetection.test.ts     # File type detection tests
│   ├── openrouter.test.ts            # OpenRouter API tests (mocked)
│   ├── ppt/
│   │   └── createPPT.test.ts         # PowerPoint generation tests
│   └── integration.test.ts           # End-to-end pipeline tests
└── README.md                         # This file
```

## Running Tests

### Install Dependencies

```bash
pnpm install
```

### Run All Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Run Tests with Coverage

```bash
pnpm test:coverage
```

### Run Specific Test File

```bash
pnpm test extractText.test.ts
```

## Test Coverage

### ✅ Text Extraction
- ✅ Plain text file extraction
- ✅ PDF extraction (mocked)
- ✅ DOCX extraction (mocked)
- ✅ File type detection
- ✅ Error handling

### ✅ OpenRouter Integration
- ✅ Text cleaning (mocked API)
- ✅ Outline generation (mocked API)
- ✅ Text chunking
- ✅ Model fallback chain
- ✅ Error handling

### ✅ PowerPoint Generation
- ✅ Basic PPT creation
- ✅ Multiple slide layouts
- ✅ Color themes
- ✅ Icons
- ✅ Edge cases (empty bullets, long titles, etc.)

### ✅ Integration Tests
- ✅ Complete pipeline (TXT → Extract → Clean → Outline → PPT)
- ✅ Large file handling with chunking
- ✅ Error handling across pipeline
- ✅ Various design combinations

## Mocking Strategy

### OpenRouter API
- All OpenRouter API calls are mocked using `jest.fn()` and `global.fetch`
- Tests verify the correct API calls are made
- Tests verify error handling when API fails

### File Extraction
- PDF and DOCX extraction use mocked libraries (`pdf-parse`, `mammoth`)
- Text extraction uses real Buffer operations (no mocking needed)
- File type detection uses real buffer analysis

## Environment Variables

Tests use mock environment variables defined in `jest.setup.js`:
- `OPENROUTER_API_KEY` - Mock API key
- `NEXT_PUBLIC_TICHA_SUPABASE_URL` - Mock Supabase URL
- `TICHA_SUPABASE_SERVICE_KEY` - Mock service key

## Writing New Tests

### Example Test Structure

```typescript
describe('functionName', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks()
  })

  it('should do something', async () => {
    // Arrange
    const input = 'test input'
    
    // Act
    const result = await functionName(input)
    
    // Assert
    expect(result).toBe('expected output')
  })
})
```

### Mocking External APIs

```typescript
// Mock fetch for OpenRouter
global.fetch = jest.fn()
;(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ /* mock response */ }),
})
```

### Mocking Modules

```typescript
jest.mock('module-name', () => ({
  functionName: jest.fn().mockResolvedValue('mock result'),
}))
```

## Test Data

- Use realistic but minimal test data
- Test edge cases (empty strings, large files, special characters)
- Test error conditions
- Keep tests independent (no shared state)

## Continuous Integration

These tests can be integrated into CI/CD pipelines:
- GitHub Actions
- GitLab CI
- CircleCI
- etc.

Add to your CI config:
```yaml
- name: Run tests
  run: pnpm test
```

## Troubleshooting

### Tests failing with "Cannot find module"
- Make sure `tsconfig.json` has correct path mappings
- Check that `jest.config.js` has correct `moduleNameMapper`

### OpenRouter API tests failing
- Ensure `global.fetch` is properly mocked
- Check that mock responses match expected format

### PDF/DOCX tests failing
- Ensure libraries are properly mocked
- Check that mock implementations return correct structure

## Next Steps

1. ✅ Basic unit tests for all modules
2. ✅ Integration tests for complete pipeline
3. 🔄 Add E2E tests with Playwright/Cypress (optional)
4. 🔄 Add performance tests (optional)
5. 🔄 Add visual regression tests for PPT output (optional)

