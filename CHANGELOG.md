# Changelog - ExamHub

All notable changes to the **ExamHub** application will be documented in this file, structured by version releases.

---

## [v0.8.0] - 2026-06-15
### Fixed
- **Corrupt LocalStorage Crash Protection**: Wrapped all LocalStorage operations (`getItem`, `JSON.parse`) in robust try-catch blocks and explicit array validation (`Array.isArray`) to handle corrupt database states (like `"null"` strings or invalid formats) without crashing the application.

---

## [v0.7.0] - 2026-06-15
### Fixed
- **Blank Page rendering error**: Fixed a critical crash where the React application rendered a blank screen on load. The error was caused by `exam.title` being undefined for custom or corrupted local exams during the migration check (`exam.title.toLowerCase()`). Resolved by adding safe fallback operators `(exam.title || '').toLowerCase()`.
- **LocalStorage Data Safety**: Enhanced database safety in both `App.jsx` and `Dashboard.jsx` by filtering out null or undefined exams and safeguarding against division by zero in average score calculations (`totalQuestions > 0` checks).

---

## [v0.6.0] - 2026-06-15
### Added
- **Dynamic Category Stats Dashboard**: Updated the Sidebar Progress Panel to reflect statistics (Total exams, Taken, Average score, Practice time) dynamically according to the selected category.
- **Category Breakdown Section**: Rendered an interactive list of all categories in the Sidebar showing their respective total exams and average score, with clicking capability to filter the dashboard grid.

### Fixed
- **Category Breakdown Row Hover Styling**: Added CSS styles in `index.css` for category list rows to render glassmorphism hover and active effects.

---

## [v0.5.0] - 2026-06-15
### Added
- **Exam Categorization**: Added a `category` property to exams allowing categorization of quizzes (e.g., "Cortex XSOAR", "JavaScript", "Science").
- **Category Filter Pills**: Rendered dynamic category tabs at the top of the Dashboard exam grid to filter quizzes in real-time.
- **Category Badge**: Added a category label at the top-left of each exam card.
- **Category Form Support**:
  - **Exam Editor**: Added a text input field for "หมวดหมู่ / เรื่อง" (Category / Topic) to assign categories manually.
  - **Text Converter**: Added a category input field to specify the category before importing text-converted quizzes.
  - **Import/Export JSON**: Updated JSON schema validation to support and preserve the `category` property.
- **Database Reset Button**: Added a red "🔄 รีเซ็ตข้อสอบเริ่มต้น" (Reset Default Exams) button on the dashboard header to allow clearing local cache and reloading default exams.
- **Version Indicator**: Displayed a premium `v0.5` version badge in the application header.

### Fixed
- **LocalStorage Category Migration**: Implemented a title-based fallback mapping inside the App mounting stage to automatically assign categories to previously imported/created exams (matching title keywords like "xsoar", "js", "science").
- **Version Badge Visibility**: Resolved a CSS bug where the `v0.5` text was rendered invisible because it inherited the `-webkit-text-fill-color: transparent` and background clipping rules from the `.app-logo` wrapper. Fixed by rendering it as an independent sibling element in the flex row.

---

## [v0.4.0] - 2026-06-15
### Changed
- **Branding Renaming**: Rebranded the application name from **XamPrep** to **ExamHub** globally.
- **Multi-Choice Engine**: Upgraded the core quiz engine to support both single-choice (radio buttons) and multi-choice (checkboxes) questions natively.
- **Multi-Choice Support**:
  - **Exam Taker**: Custom options selector with a "Verify Selection" validation button for checkbox selections.
  - **Exam Editor**: Dropdown to select question type and multi-select capability for correct answers.
  - **Text Converter**: Expanded regex parser to recognize comma-separated correct answers (e.g., `Answer: C, D`).
  - **Import/Export JSON**: Updated schema validator to accept both numbers and number arrays for `correctAnswer` values.
- **Bilingual Translation Layout**: Formatted rendering of questions containing `\n(แปลไทย: ...)` blocks to display the Thai translation in a smaller, gray, italicized block below the English question.
- **Attempts History Retention Limit**: Configured scoring submissions to retain only the **3 most recent attempts (3 versions)** per exam in local storage to prevent memory bloat.

### Fixed
- **Center Circle Alignment**: Fixed a center-alignment offset bug (20px off-center) on the circular radial progress SVG in the Results view.
- **Card Collision**: Resolved card overflow by changing fixed heights on `.exam-card` to a responsive `min-height: 280px`.

---

## [v0.1.0] - 2026-06-15
### Added
- **Initial Release**: Launched the initial structure of the Exam practice application using Vite + React + Vanilla CSS (dark glassmorphic theme).
- **Core Views**:
  - **Dashboard**: Stats and exam list.
  - **Exam Taker**: Running timer, question status panel, and practice/exam mode switcher.
  - **Exam Creator Form**: Creating and editing custom questions.
  - **Text-to-Exam Converter**: Raw text parsing engine using regex.
  - **Import/Export Center**: Modal for backup/restore using JSON format.
