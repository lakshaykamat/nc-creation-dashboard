# Article Detection from Email HTML

This document explains how the system detects and extracts article information from email HTML content.

## Overview

The article detection system processes email HTML to identify article IDs, page numbers, and optional source types (DOCX, TEX). The process involves multiple steps from HTML cleaning to final article extraction.

**Key Focus:**
- Extract **ARTICLE ID** (e.g., `CDC101217`)
- Extract **PAGE NUMBER** (e.g., `24`) - the last valid number before date/time boundary
- Detect **SOURCE** (DOCX or TEX) if available

The system prioritizes simplicity and accuracy, focusing only on these core data points. The page number detection strategy remembers the last valid number seen before encountering a date/time pattern, ensuring correct extraction even when multiple numbers appear (e.g., "eMFC - 48 28").

## Architecture

The article detection flow consists of several layers:

```
Email HTML
    ↓
getEmailHtmlContent() - Extract HTML from email object
    ↓
extractArticleData() - Main extraction function
    ↓
ArticleExtractionResult { articles[], totalFiles, totalPages }
    ↓
extractUniqueArticlesFromEmail() - Convert to legacy format
    ↓
Final Article Data (articleNumbers, pageMap, formattedEntries)
```

## Step-by-Step Process

### 1. HTML Content Extraction

**Location:** `lib/emails/email/email-content-utils.ts`

The system first extracts HTML content from the email object, prioritizing:
1. `email.html` (if available)
2. `email.textAsHtml` (fallback)
3. `email.text` (final fallback)

```typescript
export function getEmailHtmlContent(email: Email): string {
  return email.html || email.textAsHtml || email.text || ""
}
```

### 2. HTML Cleaning and Normalization

**Location:** `lib/common/article-extractor.ts` (Step 1)

Raw HTML is cleaned and normalized to plain text:

1. **Convert line breaks:**
   - `<br>` tags → newlines
   - `</p>` tags → newlines
   - `<li>` tags → newlines

2. **Remove HTML tags:**
   - All remaining HTML tags are stripped: `<[^>]+>`

3. **Normalize whitespace:**
   - `&nbsp;` → regular space
   - Windows line endings (`\r\n`) → Unix (`\n`)
   - Multiple consecutive newlines → single newline
   - Leading/trailing whitespace trimmed

**Example:**
```html
<!-- Input -->
<p>Article CDC101217 TEX 24<br/>12-12-2025 21:48</p>

<!-- After cleaning -->
Article CDC101217 TEX 24
12-12-2025 21:48

Note: Date/time patterns are not used for validation anymore.
The system focuses only on article ID and page number detection.
```

### 3. Tokenization

**Location:** `lib/common/article-extractor.ts` (Step 2)

The cleaned text is split into tokens (words/numbers) using whitespace as delimiters:

```typescript
const tokens = cleanedText.split(/\s+/).filter(Boolean)
```

**Example:**
```
Input: "Article CDC101217 TEX 24 12-12-2025 21:48"
Tokens: ["Article", "CDC101217", "TEX", "24", "12-12-2025", "21:48"]
         (ignored)   (article)    (source) (pages)   (ignored)
```

### 4. Article ID Detection

**Location:** `lib/common/article-extractor.ts` (Step 3)

The system iterates through tokens looking for article IDs using a regex pattern.

#### Article ID Pattern

**Location:** `lib/constants/article-regex-constants.ts`

```typescript
ARTICLE_ID_PATTERN = /^[A-Z]{2,}[A-Z0-9]*\d$/
```

**Pattern Explanation:**
- `^[A-Z]{2,}` - Starts with 2+ uppercase letters
- `[A-Z0-9]*` - Followed by any number of uppercase letters or digits
- `\d$` - Must end with a digit

**Valid Examples:**
- `CDC101217` ✅
- `EA147928` ✅
- `SIGPRO110443` ✅
- `ATECH101714` ✅
- `FUFO100875` ✅

**Invalid Examples:**
- `CDC` ❌ (no ending digit)
- `cdc101217` ❌ (lowercase letters)
- `101217` ❌ (doesn't start with letters)


### 6. Source Detection

**Location:** `lib/common/article-extractor.ts` (Step 4.5)

After detecting an article ID, the system checks the token immediately *after* the article ID to **capture and store** the source type (DOCX or TEX).

**Source Detection:**
- If the next token is `"DOCX"` or `"TEX"`, it is **captured and stored** as the article source
- The source is optional and may not always be present
- Only DOCX and TEX are captured as source values
- The captured source is stored in the `ArticleData` object

**Example:**
```
CDC101217 TEX 24
          ↑
          └─ Source captured: "TEX" (stored in article data)
```

**Important:** We **capture** the source value, but later we **skip** source codes (and other non-numeric tokens) when scanning forward to find the page number.

### 7. Page Number Extraction

**Location:** `lib/common/article-extractor.ts` (Step 5)

After capturing the source, the system scans forward to find the page count. The strategy is to **remember the last valid number** seen before hitting a date/time boundary.

#### Step 5.1: Skip Special Tokens

When scanning for page numbers, the system **skips** these tokens:

1. **eMFC patterns** (eMFC, eMFC-123, eMFC:123, etc.)
2. **Hyphens** (`-`)

**Note:** Unlike source codes which are captured earlier, eMFC tokens and hyphens are simply skipped during the scan.

#### Step 5.2: Remember Last Valid Number

As the system scans forward, it **captures and remembers** any numeric token that appears:

**Page Count Pattern:**
```typescript
PAGE_COUNT_PATTERN = /^\d+$/
```

**Validation:**
- Must be a valid integer
- Range: 0 to 10,000
- The **last** valid number seen before a date/time boundary is used as the page count

#### Step 5.3: Stop at Date/Time Boundary

The scan stops when it encounters a date/time pattern. The system uses these regex patterns:

**Date Patterns:**
- Slash format: `/^\d{1,2}\/\d{1,2}\/\d{4}$/` (e.g., `12/12/2025`, `1/1/2025`)
- Dash format: `/^\d{1,2}-\d{1,2}-\d{4}$/` (e.g., `12-12-2025`, `1-1-2025`)

**Time Pattern:**
- Time format: `/^\d{1,2}:\d{2}$/` (e.g., `06:58`, `6:58`)

**Supported Combinations:**
- `12/12/2025` (date only - slash format)
- `12-12-2025` (date only - dash format)
- `12/12/2025 06:58` (date + time - slash format)
- `12-12-2025 06:58` (date + time - dash format)
- `12/12/2025 06:58 AM` (date + time + AM/PM - slash format)
- `06:58` (time only)
- `06:58 AM` (time with AM/PM)

**Example Article Block:**
```
EABE106602 DOCX eMFC - 48 28 12/12/2025 06:58
           ↑    ↑    ↑   ↑  ↑
           │    │    │   │  └─ Date/time boundary - stops here
           │    │    │   └─ Last number before boundary - used as page count (28)
           │    │    └─ Number 48 - remembered but later overwritten
           │    └─ eMFC - skipped
           └─ Source "DOCX" - captured as source earlier
```

In this example:
- Source "DOCX" was **captured** earlier as the article source
- "eMFC" and "-" are **skipped**
- Number "48" is encountered and remembered
- Number "28" is encountered and becomes the new last number (overwrites 48)
- Date/time boundary is reached, so "28" is used as the page count

**Key Point:** The system uses the **last valid number** seen before the date/time boundary, not the first one. This handles cases where multiple numbers appear (e.g., in patterns like "eMFC - 48 28").

### 8. Article Validation and Storage

**Location:** `lib/common/article-extractor.ts` (Step 6)

An article is only included if:
- A valid page number was found (0-10,000), OR
- The page number is explicitly 0

**Deduplication:**
- Uses a `Set<string>` to track seen article codes
- Converts article IDs to uppercase for consistent matching
- Only the first occurrence of each article ID is processed

**Storage:**
- Articles are stored as an array of `ArticleData` objects
- Each `ArticleData` contains:
  - `articleId: string` - The article identifier
  - `pageNumber: number` - The number of pages (last valid number before date/time boundary)
  - `source?: string` - Optional source type (DOCX or TEX) - **captured** from the token immediately after the article ID

**Important points:**
- The source (DOCX or TEX) is **captured and stored** in Step 6 (Source Detection) before page scanning begins
- During page number extraction, the system remembers the **last valid number** seen before hitting a date/time boundary
- This approach correctly handles cases like "eMFC - 48 28" where 28 is the actual page number, not 48

### 9. Result Formatting

**Location:** `lib/common/article-extractor.ts` (Step 7)

The extraction function returns an `ArticleExtractionResult` object:

```typescript
interface ArticleData {
  articleId: string
  pageNumber: number
  source?: string  // DOCX, TEX, etc. (optional)
}

interface ArticleExtractionResult {
  articles: ArticleData[]  // Array of article data objects
  totalFiles: number       // Count of articles
  totalPages: number       // Sum of all page counts
}
```

**Example Result:**
```typescript
{
  articles: [
    { articleId: "CDC101217", pageNumber: 24, source: "TEX" },
    { articleId: "EA147928", pageNumber: 29, source: "DOCX" }
  ],
  totalFiles: 2,
  totalPages: 53
}
```

### 10. Email-Specific Processing

**Location:** `lib/emails/articles/article-extraction-from-email-utils.ts`

After extraction, email-specific processing converts the new format to the legacy format for backward compatibility:

1. **Extract Article IDs:**
   - Maps `articles[]` to `articleNumbers[]`

2. **Uniqueness Filtering:**
   - Uses `getUniqueArticleNumbers()` to ensure no duplicates
   - Handles case-insensitive matching

3. **Build Page Map:**
   - Creates `pageMap: Record<string, number>` from the articles array

4. **Format Entries:**
   - Creates formatted entry strings: `"ARTICLE_ID [pages]"`

5. **Final Output:**
   ```typescript
   {
     articleNumbers: string[]          // ["CDC101217", "EA147928"]
     pageMap: Record<string, number>   // { "CDC101217": 24, "EA147928": 29 }
     formattedEntries: string[]        // ["CDC101217 [24]", "EA147928 [29]"]
   }
   ```

**Note:** The core extraction function now returns a simpler format focused on `articleId`, `pageNumber`, and optional `source`. The email-specific wrapper maintains backward compatibility with existing code.

## Real-World Example

### Input Email HTML

```html
<table>
  <tr>
    <td>CDC101217</td>
    <td>TEX</td>
    <td>24</td>
    <td>12-12-2025</td>
    <td>21:48</td>
  </tr>
  <tr>
    <td>EA147928</td>
    <td>DOCX</td>
    <td>29</td>
    <td>11/12/2025</td>
    <td>11:07 PM</td>
  </tr>
</table>
```

### Processing Steps

1. **HTML Cleaning:**
   ```
   CDC101217 TEX 24 12-12-2025 21:48
   EA147928 DOCX 29 11/12/2025 11:07 PM
   ```

2. **Tokenization:**
   ```
   ["CDC101217", "TEX", "24", "12-12-2025", "21:48", "EA147928", "DOCX", "29", "11/12/2025", "11:07", "PM"]
   ```

3. **Article Detection:**
   - Found: `CDC101217`
     - Source **captured**: `TEX` (stored in article data)
     - Scans forward, finds number `24` before date/time boundary
     - Page: `24` (last number before boundary)
   - Found: `EA147928`
     - Source **captured**: `DOCX` (stored in article data)
     - Scans forward, finds number `29` before date/time boundary
     - Page: `29` (last number before boundary)

4. **Core Extraction Result:**
   ```typescript
   {
     articles: [
       { articleId: "CDC101217", pageNumber: 24, source: "TEX" },
       { articleId: "EA147928", pageNumber: 29, source: "DOCX" }
     ],
     totalFiles: 2,
     totalPages: 53
   }
   ```

5. **Email Processing Output (Legacy Format):**
   ```typescript
   {
     articleNumbers: ["CDC101217", "EA147928"],
     pageMap: {
       "CDC101217": 24,
       "EA147928": 29
     },
     formattedEntries: [
       "CDC101217 [24]",
       "EA147928 [29]"
     ]
   }
   ```

## Common Edge Cases

### 1. Missing Page Numbers

If no valid page number is found after an article ID, the article is **not included** in the results.

### 2. Duplicate Article IDs

Only the **first occurrence** of each article ID is processed. Subsequent duplicates are skipped.

### 3. Multiple Numbers Before Date/Time

The system correctly handles cases where multiple numbers appear before the date/time boundary:

**Example:**
```
EABE106602 DOCX eMFC - 48 28 12/12/2025 06:58
           ↑    ↑    ↑   ↑  ↑
           │    │    │   │  └─ Date/time boundary - stops here
           │    │    │   └─ Last number (28) - used as page count
           │    │    └─ Number (48) - remembered but overwritten by 28
           │    └─ eMFC - skipped
           └─ DOCX - captured as source earlier
```

**Result:** Page number = `28` (the last valid number before the boundary)

**Key Points:**
- Source (DOCX/TEX) is captured from the token immediately after the article ID
- eMFC tokens and hyphens are skipped during page scanning
- All numeric tokens are remembered, but only the **last one** before the date/time boundary is used
- This ensures correct page extraction even when patterns like "eMFC - 48" appear before the actual page number

### 4. Source Detection and Page Number Scanning

The system has two distinct steps:

1. **Source Capture (Step 6):** Captures and stores DOCX or TEX from the token immediately after the article ID
2. **Page Number Scanning (Step 7):** Remembers the last valid number seen before hitting a date/time boundary, skipping eMFC tokens and hyphens

**Important:** Only DOCX and TEX are captured as source values. eMFC patterns are not captured as source, they are simply skipped during page scanning.

## Constants and Patterns

All regex patterns are centralized in:
**`lib/constants/article-regex-constants.ts`**

This ensures consistency across:
- Email article extraction
- Pasted data parsing
- File allocation parsing
- Other article detection scenarios

## Performance Considerations

- **Token-based scanning:** Efficient linear scan through tokens
- **Early termination:** Stops scanning after finding date/time patterns
- **Deduplication:** Uses Set for O(1) duplicate checking
- **Pattern matching:** Pre-compiled regex patterns for fast matching

## Testing

To test article detection:

1. **Unit Tests:** Test individual regex patterns
2. **Integration Tests:** Test full extraction on sample email HTML
3. **Edge Cases:** Test various date formats, missing data, duplicates

## Related Files

- **Main Extractor:** `lib/common/article-extractor.ts`
- **Email Utilities:** `lib/emails/articles/article-extraction-from-email-utils.ts`
- **Pattern Constants:** `lib/constants/article-regex-constants.ts`
- **Email Content:** `lib/emails/email/email-content-utils.ts`
- **Uniqueness Utils:** `lib/emails/articles/article-uniqueness-utils.ts`
- **Page Map Utils:** `lib/emails/articles/article-page-map-utils.ts`

