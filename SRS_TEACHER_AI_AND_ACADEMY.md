# Software Requirements Specification (SRS)
## Teacher AI (TichaAI) & Prep School Academy

**Document Version:** 1.0  
**Date:** December 2024  
**Project:** PrepSkul Web Platform  
**Sections Covered:** Teacher AI (TichaAI) & Prep School Academy

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Teacher AI (TichaAI) System](#2-teacher-ai-tichaai-system)
3. [Prep School Academy System](#3-prep-school-academy-system)
4. [System Architecture](#4-system-architecture)
5. [Technical Specifications](#5-technical-specifications)
6. [Database Schema](#6-database-schema)
7. [API Specifications](#7-api-specifications)
8. [User Flows](#8-user-flows)
9. [Security & Authentication](#9-security--authentication)
10. [Dependencies & Environment](#10-dependencies--environment)
11. [Development Guidelines](#11-development-guidelines)

---

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive Software Requirements Specification (SRS) for two critical sections of the PrepSkul platform:
- **Teacher AI (TichaAI)**: An AI-powered presentation generation system
- **Prep School Academy**: A teacher training and certification platform

### 1.2 Scope
This SRS covers:
- Functional requirements for both systems
- Technical architecture and implementation details
- Database schemas and data models
- API endpoints and integrations
- User authentication and authorization
- File processing workflows
- Progress tracking mechanisms

### 1.3 Target Audience
- Software developers joining the project
- Technical leads and architects
- QA engineers
- Project managers

### 1.4 Document Conventions
- **Bold** indicates key terms and system names
- `Code blocks` indicate file paths, code snippets, or technical identifiers
- *Italics* indicate emphasis or optional features

---

## 2. Teacher AI (TichaAI) System

### 2.1 Overview
**TichaAI** is an AI-powered system that automatically converts educational content files (PDF, DOCX, images, text) into professionally designed PowerPoint presentations. The system uses advanced AI models for text processing, content structuring, and design generation.

### 2.2 Core Functionality

#### 2.2.1 File Upload & Processing
- **Supported Formats:**
  - PDF documents (`.pdf`)
  - Microsoft Word documents (`.docx`)
  - Text files (`.txt`)
  - Image files (`.jpg`, `.png`, `.gif`)
- **File Size Limit:** 50MB per file
- **Upload Method:** Drag-and-drop interface with file validation
- **Storage:** Files uploaded to Supabase Storage bucket `uploads`

#### 2.2.2 Text Extraction Pipeline
The system extracts text content based on file type:

1. **PDF Extraction** (`lib/ticha/extract/extractPdf.ts`)
   - Uses `pdf-parse` library
   - Extracts text, preserving structure where possible
   - Handles multi-page documents

2. **DOCX Extraction** (`lib/ticha/extract/extractDocx.ts`)
   - Uses `mammoth` library
   - Converts DOCX to HTML, then extracts text
   - Preserves formatting hints

3. **Text File Extraction** (`lib/ticha/extract/extractText.ts`)
   - Direct UTF-8 text reading
   - Handles various text encodings

4. **Image OCR** (`lib/ticha/extract/extractImage.ts`)
   - Primary: OpenRouter Vision API (requires credits)
   - Fallback: Tesseract.js (currently disabled for server-side)
   - Extracts text from images containing educational content

#### 2.2.3 AI Processing Pipeline

**Step 1: Text Cleaning** (`lib/ticha/openrouter.ts` - `cleanText()`)
- Removes excessive whitespace and formatting artifacts
- Fixes OCR errors and typos
- Normalizes punctuation and capitalization
- Preserves paragraph structure and bullet points
- Uses multiple AI models with fallback chain:
  - `qwen/qwen-2-7b-instruct` (primary)
  - `qwen/qwen-2-14b-instruct` (fallback)
  - `meta-llama/llama-3.2-3b-instruct` (free tier)
  - `mistralai/mistral-7b-instruct` (fallback)
  - `google/gemini-flash-1.5` (fallback)

**Step 2: Outline Generation** (`lib/ticha/openrouter.ts` - `generateOutline()`)
- Analyzes cleaned text content
- Generates structured slide outline with:
  - Slide titles
  - Bullet points per slide
  - Design specifications (layout, colors, icons)
- Supports user prompts for customization
- Uses design-focused AI prompts emphasizing visual hierarchy
- Model: `qwen/qwen-2-14b-instruct` (primary)

**Step 3: Design Matching** (`lib/ticha/design/matcher.ts`)
- Matches user prompts to existing design templates
- Supports design presets: `business`, `academic`, `kids`
- Custom design prompt support
- Design set selection (manual or aggregated)

#### 2.2.4 PowerPoint Generation

**PPT Creation Engine** (`lib/ticha/ppt/createPPT.ts`)
- Library: `pptxgenjs` (v3.12.0)
- Generates `.pptx` files compatible with Microsoft PowerPoint

**Layout Templates (5 types):**
1. `title-only`: Impactful opening/closing slides
2. `title-and-bullets`: Standard content slides
3. `two-column`: Comparisons and side-by-side content
4. `image-left`: Visual-heavy slides with text
5. `image-right`: Content-first with supporting visuals

**Color Themes (5 options):**
1. `light-blue`: Friendly, professional, modern
2. `dark-blue`: Authoritative, trustworthy, serious
3. `white`: Clean, minimalist, high contrast
4. `gray`: Neutral, balanced, corporate
5. `green`: Growth, success, positive

**Icon Options (5 types):**
- `none`: Clean, text-focused
- `book`: Educational content
- `idea`: Innovation, concepts
- `warning`: Important notices
- `check`: Accomplishments, success

**Brand Design System:**
- **Title Font:** Poppins
- **Body Font:** Inter
- Consistent spacing and styling
- Decorative elements for visual polish

#### 2.2.5 File Storage & Management
- Generated presentations stored in Supabase Storage bucket `generated`
- File path structure: `{userId}/presentation-{timestamp}.pptx`
- Database records created in `ticha_presentations` table
- Download URLs provided to users

### 2.3 User Interface Components

#### 2.3.1 File Upload Component
- **Location:** `components/ticha/file-upload.tsx`
- **Features:**
  - Drag-and-drop interface
  - File type validation
  - File size validation (50MB limit)
  - Visual feedback during upload
  - Progress indicators

#### 2.3.2 Presentation Generation Interface
- **Location:** `app/ticha/` directory
- **Features:**
  - File upload interface
  - Optional prompt input for customization
  - Design preset selection
  - Generation progress tracking
  - Download interface for generated presentations

#### 2.3.3 Presentation Viewer
- **Location:** `app/ticha/viewer/`
- **Features:**
  - Slide-by-slide preview
  - Presentation metadata display
  - Download functionality
  - Refinement options

### 2.4 API Endpoints

#### 2.4.1 File Upload API
- **Endpoint:** `POST /api/ticha/upload`
- **Purpose:** Upload files to Supabase Storage
- **Request:** Multipart form data with file
- **Response:** File URL for use in generation

#### 2.4.2 Presentation Generation API
- **Endpoint:** `POST /api/ticha/generate`
- **Purpose:** Complete pipeline from file to PPT
- **Request Body:**
  ```json
  {
    "fileUrl": "https://...supabase.co/storage/v1/object/public/uploads/path/to/file.pdf",
    "prompt": "Optional user prompt for customization",
    "userId": "optional-user-id",
    "designPreset": "business|academic|kids",
    "customDesignPrompt": "Optional custom design instructions",
    "designSetId": "Optional design set identifier"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "downloadUrl": "https://...supabase.co/storage/v1/object/public/generated/user-id/presentation-1234567890.pptx",
    "slides": 8,
    "slidesData": [...],
    "processingTime": "12.45s",
    "presentationId": "uuid",
    "presentationData": {...}
  }
  ```

#### 2.4.3 Presentation Refinement API
- **Endpoint:** `POST /api/ticha/refine`
- **Purpose:** Refine existing presentations based on user feedback
- **Request:** Presentation ID and refinement instructions
- **Response:** Updated presentation data

#### 2.4.4 PPT Regeneration API
- **Endpoint:** `POST /api/ticha/ppt/regenerate`
- **Purpose:** Regenerate PPT from existing slide data
- **Request:** Presentation ID and optional design changes
- **Response:** New PPT download URL

### 2.5 Processing Flow

```
1. User uploads file (PDF/DOCX/TXT/Image)
   ↓TYTR
2. File uploaded to Supabase Storage (`uploads` bucket)
   ↓
3. File downloaded from storage for processing
   ↓
4. Text extracted based on file type:
   - PDF → pdf-parse
   - DOCX → mammoth
   - TXT → direct read
   - Image → OpenRouter Vision OCR
   ↓
5. Text cleaned with AI (OpenRouter)
   - Chunked if > 3000 characters
   - Multiple model fallback chain
   ↓
6. Design matching (if enabled)
   - Matches prompt to existing designs
   - Applies design presets
   ↓
7. Presentation outline generated with AI (OpenRouter)
   - Includes slide titles, bullets, design specs
   - Design context from matched designs/presets
   ↓
8. PowerPoint created (pptxgenjs)
   - Applies layouts, themes, icons
   - Uses brand design system
   ↓
9. PPT uploaded to Supabase Storage (`generated` bucket)
   ↓
10. Database record created in `ticha_presentations`
   ↓
11. Download URL returned to user
```

### 2.6 Error Handling
- File size validation (50MB limit)
- File type validation
- Text extraction failures (unsupported formats)
- AI API failures (credits, rate limits)
- Storage upload/download failures
- Processing timeout (60 seconds max)
- Graceful fallbacks at each step

### 2.7 Cost Considerations
- **OpenRouter Credits Required:**
  - Text cleaning: ~$0.0001-0.0009 per document
  - Outline generation: ~$0.0002-0.001 per document
  - Image OCR: ~$0.01-0.10 per image (requires credits)
- **Minimum Recommended:** $10 for testing
- **Cost per complete cycle:** $0.0003-0.002 (excluding image OCR)

---

## 3. Prep School Academy System

### 3.1 Overview
**Prep School Academy** is a comprehensive teacher training and certification platform. It provides structured, interactive training modules covering early childhood development to advanced teaching strategies, with progress tracking, assessments, and certification.

### 3.2 Core Functionality

#### 3.2.1 Educational Levels
The Academy is organized into three main levels:

1. **Nursery Level** (`nursery`)
   - Target: Educators working with children aged 3-5
   - Focus: Early childhood pedagogy, play-based learning, safety basics
   - Modules: Multiple modules covering nursery education fundamentals

2. **Primary Level** (`primary`)
   - Target: Educators working with children aged 6-11
   - Focus: Core subject teaching, phonics, problem-solving, engagement strategies
   - Modules: Multiple modules covering primary education methods

3. **Secondary Level** (`secondary`)
   - Target: Educators working with teenagers
   - Focus: Advanced teaching strategies, subject-depth instruction, exam preparation
   - Modules: Multiple modules covering secondary education approaches

#### 3.2.2 Module Structure
Each level contains multiple modules, and each module contains:

- **Module Metadata:**
  - Unique ID (e.g., `n1`, `p1`, `s1`)
  - Title and description
  - Learning objectives

- **Content Sections:**
  - Section ID (e.g., `1-1`, `1-2`)
  - Section title
  - HTML content (educational material)
  - Optional YouTube video embeds
  - Video captions

- **Module Quiz:**
  - Multiple-choice questions
  - 3-5 questions per module
  - Correct answer tracking
  - Pass threshold: 70%

#### 3.2.3 Progress Tracking System

**Module Progress:**
- Quiz scores (0-100%)
- Pass status (≥70% required)
- Section completion tracking
- Watched sections (for video content)
- Scroll progress (for text-only content)
- Timestamps (started_at, completed_at)

**Level Progress:**
- Module completion status
- Final quiz eligibility (all modules must be passed)
- Certificate eligibility

**Progress Storage:**
- All progress stored in Supabase (no localStorage)
- Real-time updates via event listeners
- Client-side caching to reduce API calls
- Automatic synchronization

#### 3.2.4 Assessment System

**Module Quizzes:**
- Location: End of each module
- Format: Multiple-choice questions
- Scoring: Percentage-based (0-100%)
- Pass Requirement: ≥70% to unlock next module
- Retake: Allowed (score updated on retake)

**Final Level Quiz:**
- Location: End of each level
- Access: Only after all modules in level are passed
- Format: Comprehensive assessment covering all modules
- Scoring: Percentage-based (0-100%)
- Pass Requirement: ≥70% to claim certificate
- One attempt per level (can retake if failed)

#### 3.2.5 Certification System
- **Certificate Generation:**
  - Triggered when user passes final level quiz (≥70%)
  - Includes tutor name, level, verification code
  - Stored in `academy_certificates` table
  - Unique verification code for authenticity

- **Certificate Display:**
  - Printable certificate page
  - Verification code display
  - Download option (PDF generation recommended)

### 3.3 User Interface Components

#### 3.3.1 Academy Landing Page
- **Location:** `app/academy/page.tsx`
- **Features:**
  - Hero section with value proposition
  - Level overview cards (Nursery, Primary, Secondary)
  - Module descriptions
  - "Get Started" button (redirects to signup)

#### 3.3.2 Authentication Pages
- **Signup Page:** `app/academy/signup/page.tsx`
  - Email and password registration
  - Form validation
  - Redirects to login after signup

- **Login Page:** `app/academy/login/page.tsx`
  - Email and password authentication
  - Session management
  - Redirects to explore page after login

#### 3.3.3 Explore Page
- **Location:** `app/academy/explore/page.tsx`
- **Features:**
  - Level selection interface
  - Progress overview (from Supabase)
  - Module cards with completion status
  - Requires authentication

#### 3.3.4 Level Dashboard
- **Location:** `app/academy/[level]/page.tsx`
- **Features:**
  - Level introduction
  - Module list with progress indicators
  - Module cards showing:
    - Title and description
    - Completion status
    - Quiz pass status
    - Lock/unlock status

#### 3.3.5 Module Page
- **Location:** `app/academy/[level]/[moduleId]/page.tsx`
- **Features:**
  - Module sidebar with section navigation
  - Section content display
  - Video player (YouTube embeds)
  - Progress tracking (watched sections)
  - Module quiz at the end
  - Next module unlock on quiz pass

#### 3.3.6 Section Page
- **Location:** `app/academy/[level]/[moduleId]/sections/[sectionId]/page.tsx`
- **Features:**
  - Individual section content
  - Video playback tracking
  - Scroll progress tracking (for text-only sections)
  - Navigation to next/previous sections

#### 3.3.7 Module Sidebar
- **Location:** `components/academy/ModuleSidebar.tsx`
- **Features:**
  - Section navigation list
  - Progress circles (completed/in-progress/not-started)
  - Real-time progress updates
  - Section click navigation

#### 3.3.8 Final Quiz Page
- **Location:** `app/academy/[level]/final-quiz/page.tsx`
- **Features:**
  - Comprehensive level assessment
  - Multiple-choice questions
  - Score calculation
  - Certificate eligibility check
  - Redirect to certificate page on pass

#### 3.3.9 Certificate Page
- **Location:** `app/academy/[level]/certificate/page.tsx`
- **Features:**
  - Certificate display
  - Verification code
  - Print functionality
  - Download option (recommended: PDF generation)

### 3.4 Authentication & Authorization

#### 3.4.1 Authentication System
- **Provider:** Supabase Auth
- **Method:** Email and password
- **Session Management:** Automatic via Supabase client
- **Protected Routes:** All academy pages except landing, signup, login

#### 3.4.2 User Flow
```
1. User visits academy landing page
   ↓
2. Clicks "Get Started" → Redirected to /academy/signup
   ↓
3. Creates account with email and password
   ↓
4. Redirected to /academy/login
   ↓
5. Signs in → Redirected to /academy/explore
   ↓
6. Can browse levels and modules
   ↓
7. Progress automatically saved to Supabase
```

#### 3.4.3 Session Management
- **Client Component:** `lib/academy-supabase.ts`
- **Server Component:** `lib/academy-supabase-server.ts`
- **Session Check:** Layout component (`app/academy/layout.tsx`)
- **Logout:** Available in layout header

### 3.5 Progress Tracking Implementation

#### 3.5.1 Progress Storage Functions
**Location:** `lib/academy-storage.ts`

Key Functions:
- `loadProgress()`: Loads all user progress from Supabase
- `recordModuleScore()`: Saves module quiz score
- `markSectionWatched()`: Marks section as completed
- `updateSectionProgress()`: Updates scroll progress for sections
- `recordFinalQuizScore()`: Saves final level quiz score
- `getCertificate()`: Retrieves certificate data

**All functions are async** and interact with Supabase.

#### 3.5.2 Progress Data Structure
```typescript
interface ModuleProgress {
  scorePercent: number; // 0-100
  watchedSections?: string[]; // Section IDs
  isPassed: boolean; // scorePercent >= 70
  sectionProgress?: Record<string, number>; // Section ID -> progress %
}

interface LevelProgress {
  modules: Record<string, ModuleProgress>; // Module ID -> ModuleProgress
  finalQuizScore?: number; // 0-100
  hasCertificate?: boolean;
}

interface AcademyProgressState {
  levels: Record<AcademyLevelId, LevelProgress>;
}
```

#### 3.5.3 Real-time Updates
- **Event System:** Custom events (`prepskul:progress-updated`)
- **Event Listeners:** Components listen for progress updates
- **Caching:** Client-side cache reduces API calls
- **Automatic Sync:** Progress saved immediately on user actions

### 3.6 Data Structure

#### 3.6.1 Module Content Structure
**Location:** `lib/academy-data.ts`

```typescript
interface AcademyModule {
  id: string; // e.g., "n1", "p1", "s1"
  title: string;
  description: string;
  content: {
    html: string; // Main content (can include sections)
    videoUrl?: string; // Optional main video
    videos?: Array<{ youtubeUrl: string; caption?: string }>;
  };
  quiz: QuizQuestion[];
  sections?: AcademySection[]; // Optional per-section breakdown
}

interface AcademySection {
  id: string; // e.g., "1-1", "1-2"
  title: string;
  html: string; // Section-specific content
  youtubeUrl: string; // Section video
  caption?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-based index
}
```

---

## 4. System Architecture

### 4.1 Technology Stack

#### 4.1.1 Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Library:** React
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui components
- **Animations:** Framer Motion

#### 4.1.2 Backend
- **Runtime:** Node.js
- **API Routes:** Next.js API Routes
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage

#### 4.1.3 AI Services
- **Provider:** OpenRouter
- **Models Used:**
  - Text Processing: Qwen 2.5 7B/14B, Llama 3.2, Mistral 7B, Gemini Flash
  - Vision: Qwen Vision, Claude 3 (Haiku/Sonnet/Opus)

#### 4.1.4 Libraries & Dependencies

**TichaAI:**
- `pptxgenjs`: PowerPoint generation
- `pdf-parse`: PDF text extraction
- `mammoth`: DOCX text extraction
- `tesseract.js`: Image OCR (fallback)
- `sharp`: Image processing

**Academy:**
- `@supabase/ssr`: Supabase SSR support
- `@supabase/supabase-js`: Supabase client

### 4.2 Project Structure

```
PrepSkul_Web/
├── app/
│   ├── academy/              # Academy pages
│   │   ├── [level]/         # Dynamic level routes
│   │   ├── explore/         # Level selection
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   └── admin/            # Admin panel
│   ├── ticha/               # TichaAI pages
│   │   └── viewer/          # Presentation viewer
│   └── api/
│       ├── ticha/           # TichaAI API endpoints
│       └── admin/            # Admin API endpoints
├── components/
│   ├── academy/             # Academy components
│   └── ticha/               # TichaAI components
├── lib/
│   ├── academy-*.ts         # Academy utilities
│   ├── ticha/               # TichaAI core logic
│   │   ├── extract/         # File extraction
│   │   ├── ppt/             # PPT generation
│   │   └── design/          # Design system
│   └── ticha-*.ts           # TichaAI utilities
└── supabase/
    └── *.sql                # Database schemas
```

### 4.3 Data Flow

#### 4.3.1 TichaAI Data Flow
```
User Upload → Supabase Storage (uploads)
  ↓
API Route (/api/ticha/generate)
  ↓
File Download → Text Extraction
  ↓
AI Processing (OpenRouter)
  ↓
PPT Generation (pptxgenjs)
  ↓
Supabase Storage (generated)
  ↓
Database Record (ticha_presentations)
  ↓
User Download
```

#### 4.3.2 Academy Data Flow
```
User Action (quiz, section view)
  ↓
Client Component
  ↓
Progress Function (lib/academy-storage.ts)
  ↓
Supabase Database (academy_progress, etc.)
  ↓
Event Dispatch (prepskul:progress-updated)
  ↓
UI Update (real-time)
```

---

## 5. Technical Specifications

### 5.1 Environment Variables

#### 5.1.1 TichaAI Configuration
```env
# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-...

# TichaAI Supabase
NEXT_PUBLIC_TICHA_SUPABASE_URL=https://...
TICHA_SUPABASE_SERVICE_KEY=eyJhbG...

# Storage Buckets
TICHA_UPLOADS_BUCKET=uploads
TICHA_GENERATED_BUCKET=generated
```

#### 5.1.2 Academy Configuration
```env
# Academy Supabase (separate from main PrepSkul)
NEXT_PUBLIC_ACADEMY_SUPABASE_URL=https://...
NEXT_PUBLIC_ACADEMY_SUPABASE_ANON_KEY=eyJhbG...

# Falls back to main Supabase if not set
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### 5.2 File Processing Specifications

#### 5.2.1 Supported File Types
- **PDF:** `.pdf` (max 50MB)
- **Word:** `.docx` (max 50MB)
- **Text:** `.txt` (max 50MB)
- **Images:** `.jpg`, `.jpeg`, `.png`, `.gif` (max 50MB)

#### 5.2.2 Processing Limits
- **Max File Size:** 50MB
- **Max Processing Time:** 60 seconds
- **Text Chunk Size:** 3000 characters (for AI processing)
- **Max Slides Generated:** No hard limit (AI-determined)

### 5.3 Performance Considerations

#### 5.3.1 TichaAI
- **Caching:** File downloads cached temporarily
- **Chunking:** Large texts split for AI processing
- **Async Processing:** All file operations are async
- **Error Recovery:** Graceful fallbacks at each step

#### 5.3.2 Academy
- **Progress Caching:** Client-side cache reduces API calls
- **Lazy Loading:** Module content loaded on demand
- **Event-Driven Updates:** Real-time updates without polling
- **Optimistic UI:** UI updates before API confirmation

---

## 6. Database Schema

### 6.1 TichaAI Database Schema

#### 6.1.1 `ticha_presentations` Table
```sql
CREATE TABLE ticha_presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  presentation_url TEXT NOT NULL,
  presentation_data JSONB NOT NULL,
  refinement_history JSONB DEFAULT '[]',
  status TEXT DEFAULT 'processing',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  design_customizations JSONB
);
```

**Key Fields:**
- `presentation_data`: Complete slide data (JSONB)
- `refinement_history`: Array of refinement operations
- `design_customizations`: Matched design IDs and metadata

#### 6.1.2 `ticha_designs` Table (if design matching enabled)
```sql
CREATE TABLE ticha_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  extracted_design JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Academy Database Schema

#### 6.2.1 `academy_profiles` Table
```sql
CREATE TABLE academy_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6.2.2 `academy_progress` Table
```sql
CREATE TABLE academy_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES academy_profiles(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  quiz_score INTEGER DEFAULT 0,
  is_passed BOOLEAN DEFAULT FALSE,
  watched_sections TEXT[] DEFAULT '{}',
  section_progress JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_id, module_id)
);
```

**Key Fields:**
- `level_id`: 'nursery', 'primary', 'secondary', 'university', 'skills'
- `watched_sections`: Array of completed section IDs
- `section_progress`: JSON object mapping section IDs to progress percentages

#### 6.2.3 `academy_level_quizzes` Table
```sql
CREATE TABLE academy_level_quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES academy_profiles(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  is_passed BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);
```

#### 6.2.4 `academy_certificates` Table
```sql
CREATE TABLE academy_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES academy_profiles(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL,
  tutor_name TEXT NOT NULL,
  verification_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);
```

### 6.3 Row Level Security (RLS)

#### 6.3.1 Academy RLS Policies
- Users can only read/write their own progress
- Users can only read their own certificates
- Admin users have elevated permissions (if admin table exists)

#### 6.3.2 TichaAI RLS Policies
- Users can read/write their own presentations
- Anonymous users can create presentations (user_id nullable)
- Admin users can read all presentations

---

## 7. API Specifications

### 7.1 TichaAI API Endpoints

#### 7.1.1 POST `/api/ticha/upload`
Upload a file for processing.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: File in `file` field

**Response:**
```json
{
  "success": true,
  "fileUrl": "https://...supabase.co/storage/v1/object/public/uploads/path/to/file.pdf",
  "fileName": "document.pdf",
  "fileSize": 1234567
}
```

#### 7.1.2 POST `/api/ticha/generate`
Generate presentation from uploaded file.

**Request:**
```json
{
  "fileUrl": "https://...supabase.co/storage/v1/object/public/uploads/path/to/file.pdf",
  "prompt": "Optional customization prompt",
  "userId": "optional-user-id",
  "designPreset": "business|academic|kids",
  "customDesignPrompt": "Optional design instructions",
  "designSetId": "optional-design-set-id"
}
```

**Response:**
```json
{
  "success": true,
  "downloadUrl": "https://...supabase.co/storage/v1/object/public/generated/user-id/presentation-1234567890.pptx",
  "slides": 8,
  "slidesData": [...],
  "processingTime": "12.45s",
  "presentationId": "uuid",
  "presentationData": {...}
}
```

**Error Responses:**
- `400`: Invalid request (missing fileUrl, invalid file type, etc.)
- `402`: OpenRouter credits required
- `500`: Internal server error

#### 7.1.3 POST `/api/ticha/refine`
Refine an existing presentation.

**Request:**
```json
{
  "presentationId": "uuid",
  "refinementPrompt": "Make slides more visual",
  "slideIds": ["slide-1", "slide-2"] // Optional: specific slides
}
```

**Response:**
```json
{
  "success": true,
  "updatedSlides": [...],
  "refinementHistory": [...]
}
```

### 7.2 Academy API Endpoints

#### 7.2.1 Progress Endpoints
All progress operations are handled client-side via Supabase client, not separate API routes.

**Functions (lib/academy-storage.ts):**
- `loadProgress()`: Fetches all user progress
- `recordModuleScore()`: Saves module quiz score
- `markSectionWatched()`: Marks section as completed
- `updateSectionProgress()`: Updates section scroll progress
- `recordFinalQuizScore()`: Saves final quiz score
- `getCertificate()`: Retrieves certificate

---

## 8. User Flows

### 8.1 TichaAI User Flow

```
1. User navigates to /ticha
   ↓
2. User uploads file (PDF/DOCX/image/text)
   ↓
3. Optional: User enters customization prompt
   ↓
4. Optional: User selects design preset
   ↓
5. User clicks "Generate Presentation"
   ↓
6. System processes file:
   - Uploads to storage
   - Extracts text
   - Cleans text with AI
   - Generates outline with AI
   - Creates PowerPoint
   - Uploads PPT to storage
   ↓
7. User receives download link
   ↓
8. User can:
   - Download presentation
   - View slides in browser
   - Refine presentation
   - Regenerate with different design
```

### 8.2 Academy User Flow

```
1. User visits /academy
   ↓
2. User clicks "Get Started"
   ↓
3. User signs up (/academy/signup)
   ↓
4. User logs in (/academy/login)
   ↓
5. User redirected to /academy/explore
   ↓
6. User selects level (Nursery/Primary/Secondary)
   ↓
7. User views level dashboard
   ↓
8. User selects module
   ↓
9. User completes module:
   - Views sections (videos/content)
   - Progress tracked automatically
   - Takes module quiz
   - Unlocks next module on pass (≥70%)
   ↓
10. User completes all modules in level
   ↓
11. User takes final level quiz
   ↓
12. User passes final quiz (≥70%)
   ↓
13. User receives certificate
   ↓
14. User can download/print certificate
```

### 8.3 Progress Tracking Flow

```
User Action (quiz submit, video end, scroll)
   ↓
Component calls progress function
   ↓
Function updates Supabase database
   ↓
Function dispatches 'prepskul:progress-updated' event
   ↓
All listening components update UI
   ↓
Progress circles update in real-time
```

---

## 9. Security & Authentication

### 9.1 TichaAI Security

#### 9.1.1 File Upload Security
- File type validation (whitelist)
- File size limits (50MB)
- Virus scanning (recommended: implement)
- Storage bucket permissions (public read, authenticated write)

#### 9.1.2 API Security
- Rate limiting (recommended: implement)
- Request validation
- Error message sanitization
- User session validation (optional, supports anonymous)

### 9.2 Academy Security

#### 9.2.1 Authentication
- Supabase Auth with email/password
- Session management via Supabase client
- Protected routes (middleware or layout checks)
- Password requirements (handled by Supabase)

#### 9.2.2 Data Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Database constraints prevent data corruption
- Secure API keys (environment variables)

#### 9.2.3 Authorization
- Regular users: Read/write own progress
- Admin users: Elevated permissions (if implemented)
- Certificate verification: Public verification codes

---

## 10. Dependencies & Environment

### 10.1 Required Dependencies

#### 10.1.1 TichaAI Dependencies
```json
{
  "pptxgenjs": "^3.12.0",
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.6.0",
  "tesseract.js": "^5.0.0",
  "sharp": "^0.32.0"
}
```

#### 10.1.2 Academy Dependencies
```json
{
  "@supabase/ssr": "^0.0.10",
  "@supabase/supabase-js": "^2.38.0"
}
```

#### 10.1.3 Shared Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "framer-motion": "^10.0.0"
}
```

### 10.2 Environment Setup

#### 10.2.1 Supabase Setup

**TichaAI Supabase:**
1. Create Supabase project
2. Create storage buckets: `uploads`, `generated`
3. Set bucket policies (public read for generated, authenticated write)
4. Run database schema: `supabase/ticha_schema.sql`
5. Add environment variables

**Academy Supabase:**
1. Create separate Supabase project (or use main)
2. Run database schema: `supabase-academy-schema.sql`
3. Configure RLS policies
4. Add environment variables

#### 10.2.2 OpenRouter Setup
1. Create account at https://openrouter.ai
2. Generate API key
3. Purchase credits (minimum $10 recommended)
4. Add API key to environment variables

### 10.3 Development Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
pnpm dev

# Build for production
pnpm build
```

---

## 11. Development Guidelines

### 11.1 Code Organization

#### 11.1.1 File Naming
- Components: PascalCase (e.g., `ModuleSidebar.tsx`)
- Utilities: camelCase (e.g., `academy-storage.ts`)
- API routes: lowercase with hyphens (e.g., `generate/route.ts`)

#### 11.1.2 Component Structure
```typescript
// Imports
import { ... } from '...'

// Types/Interfaces
interface ComponentProps { ... }

// Component
export default function Component({ ... }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
  return (...)
}
```

#### 11.1.3 API Route Structure
```typescript
// Imports
import { NextRequest, NextResponse } from 'next/server'

// Types
interface RequestBody { ... }

// Handler
export async function POST(request: NextRequest) {
  try {
    // Validation
    // Processing
    // Response
  } catch (error) {
    // Error handling
  }
}
```

### 11.2 Error Handling

#### 11.2.1 TichaAI Error Handling
- Validate inputs at API entry point
- Handle file extraction errors gracefully
- Provide fallback models for AI processing
- Log errors with context
- Return user-friendly error messages

#### 11.2.2 Academy Error Handling
- Validate user input (quiz answers, etc.)
- Handle Supabase errors gracefully
- Show loading states during async operations
- Display user-friendly error messages
- Retry failed operations where appropriate

### 11.3 Testing Guidelines

#### 11.3.1 TichaAI Testing
- Test file upload with various formats
- Test text extraction for each file type
- Test AI processing with sample content
- Test PPT generation with various designs
- Test error scenarios (large files, invalid formats, API failures)

#### 11.3.2 Academy Testing
- Test authentication flow (signup, login, logout)
- Test progress tracking (module completion, quiz scores)
- Test certificate generation
- Test real-time progress updates
- Test error scenarios (network failures, invalid data)

### 11.4 Performance Optimization

#### 11.4.1 TichaAI
- Chunk large texts for AI processing
- Cache file downloads temporarily
- Use efficient image processing
- Optimize PPT generation (batch operations)

#### 11.4.2 Academy
- Cache progress data client-side
- Lazy load module content
- Use event-driven updates (not polling)
- Optimize database queries (indexes, select specific fields)

### 11.5 Documentation Standards

#### 11.5.1 Code Comments
- Document complex functions
- Explain non-obvious logic
- Include parameter descriptions
- Add usage examples for utilities

#### 11.5.2 Type Definitions
- Use TypeScript interfaces for all data structures
- Export types for reuse
- Document optional fields
- Use enums for constants

### 11.6 Git Workflow

#### 11.6.1 Branch Naming
- `feature/ticha-*`: TichaAI features
- `feature/academy-*`: Academy features
- `fix/ticha-*`: TichaAI bug fixes
- `fix/academy-*`: Academy bug fixes
- `docs/*`: Documentation updates

#### 11.6.2 Commit Messages
- Use clear, descriptive messages
- Reference issue numbers if applicable
- Separate subject from body with blank line
- Use imperative mood ("Add feature" not "Added feature")

---

## 12. Future Enhancements

### 12.1 TichaAI Enhancements
- [ ] Batch file processing
- [ ] Custom template upload
- [ ] Collaborative editing
- [ ] Presentation analytics
- [ ] Export to other formats (PDF, Google Slides)
- [ ] AI-powered image generation for slides
- [ ] Multi-language support

### 12.2 Academy Enhancements
- [ ] Video progress tracking (seek position)
- [ ] Discussion forums per module
- [ ] Peer review system
- [ ] Badge system
- [ ] Leaderboards
- [ ] Mobile app
- [ ] Offline content download
- [ ] Multi-language content

---

## 13. Troubleshooting Guide

### 13.1 Common TichaAI Issues

#### Issue: "OpenRouter credits required"
**Solution:** Purchase credits at https://openrouter.ai/settings/credits

#### Issue: "File too large"
**Solution:** Reduce file size or implement chunking for large files

#### Issue: "Failed to extract text"
**Solution:** Check file format support, verify file is not corrupted

### 13.2 Common Academy Issues

#### Issue: "Progress not saving"
**Solution:** Check Supabase connection, verify RLS policies, check user authentication

#### Issue: "Certificate not generating"
**Solution:** Verify final quiz score ≥70%, check certificate table permissions

#### Issue: "Module not unlocking"
**Solution:** Verify module quiz score ≥70%, check progress table updates

---

## 14. Contact & Support

### 14.1 Technical Questions
- Review this SRS document first
- Check existing code comments
- Review related documentation files:
  - `TICHA_BACKEND_IMPLEMENTATION.md`
  - `ACADEMY_AUTH_IMPLEMENTATION.md`
  - `TICHA_READINESS_REPORT.md`

### 14.2 Code Locations Reference

**TichaAI Core:**
- File extraction: `lib/ticha/extract/`
- AI processing: `lib/ticha/openrouter.ts`
- PPT generation: `lib/ticha/ppt/createPPT.ts`
- API routes: `app/api/ticha/`
- Components: `components/ticha/`

**Academy Core:**
- Progress tracking: `lib/academy-storage.ts`
- Data structure: `lib/academy-data.ts`
- Supabase clients: `lib/academy-supabase*.ts`
- Pages: `app/academy/`
- Components: `components/academy/`

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2024 | Initial | Initial SRS document creation |

---

**End of Document**

