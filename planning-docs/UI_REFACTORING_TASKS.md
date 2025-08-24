# UI/UX Refactoring Task List - Figma Variable Explorer

## Priority System: 🔥 Critical | ⭐ High | 📌 Medium | 💡 Nice-to-have

---

## 🎯 TIER 1: QUICK WINS (Highest Impact, Lowest Effort)

### 🔥 Task 1: Optimize Plugin Window Dimensions
**File:** `src-2.0/main.ts`
**Current:** 300px × 800px (too narrow)
**Target:** 420px × 600px (better aspect ratio)
**Description:** Update showUI dimensions for optimal content visibility and professional appearance
**Impact:** Massive UX improvement with 2-line code change
**Estimated Time:** 5 minutes

### 🔥 Task 2: Enhance Collections Selector Styling
**File:** `src-2.0/style.css` (.collectionSelectorBox)
**Description:** Style native dropdown to match design system with proper typography, spacing, hover states, focus indicators
**Changes:**
- Add proper typography tokens
- Implement hover/focus states 
- Add transition animations
- Set min/max width constraints
- Style dropdown options for both themes
**Impact:** Professional look, better visual hierarchy
**Estimated Time:** 30 minutes

### 🔥 Task 3: Fix Search Bar Issues
**File:** `src-2.0/components/SearchBar.tsx` + `src-2.0/style.css`
**Description:** Improve search experience and fix existing bugs
**Changes:**
- Fix placeholder text truncation (smart truncation for long collection names)
- Correct input type casting (HTMLSelectElement → HTMLInputElement) 
- Add autoFocus for better UX
- Fix title formatting bug (remove line break)
- Improve responsive behavior in narrow windows
**Impact:** Better usability, no more truncated text
**Estimated Time:** 20 minutes

### ⭐ Task 4: Increase Color Swatch Size
**File:** `src-2.0/style.css` (.colorTileValue)
**Current:** 18px × 18px
**Target:** 24px × 24px
**Description:** Make color swatches more clickable and visible
**Impact:** Better accessibility and usability
**Estimated Time:** 5 minutes

---

## 🎯 TIER 2: POLISH IMPROVEMENTS (Medium Impact, Low Effort)

### ⭐ Task 5: Implement Copy Feedback System
**Files:** New toast component + integration across value renderers
**Description:** Add visual feedback when users copy values (toast notifications or temporary status)
**Changes:**
- Create lightweight toast notification system
- Integrate with existing copy functions
- Style toasts to match design system
**Impact:** Clear user feedback, professional feel
**Estimated Time:** 2 hours

### ⭐ Task 6: Add Loading State Polish
**Files:** `src-2.0/screens/Variables.tsx` + new skeleton components
**Description:** Replace basic "Loading..." text with skeleton loaders
**Changes:**
- Create skeleton components for table rows
- Add skeleton for header area
- Implement loading animations
**Impact:** Perceived performance improvement
**Estimated Time:** 1.5 hours

### ⭐ Task 7: Enhance Column Resize Discoverability
**File:** `src-2.0/style.css` (.resizeHandle)
**Description:** Make column resize handles more visible and discoverable
**Changes:**
- Add subtle visual indicators (dotted lines or grip patterns)
- Improve hover states
- Add cursor feedback
- Consider always-visible resize indicators
**Impact:** Much more discoverable resize functionality
**Estimated Time:** 45 minutes

### 📌 Task 8: Comprehensive Theme Audit & Fixes
**Files:** `src-2.0/style.css` (all theme-related classes)
**Description:** Ensure consistent theming across ALL components
**Components to verify:**
- Header popovers (settings, options)
- Table sticky columns background
- Modal overlays and content
- Search input and close button
- Collections selector dropdown
- Alias resolution popovers
- Value renderer components
- Loading states
**Changes:**
- Fix any contrast issues
- Ensure proper background inheritance
- Verify text readability in both themes
- Test all interactive states
**Impact:** Professional, consistent experience
**Estimated Time:** 3 hours

---

## 🎯 TIER 3: ADVANCED FEATURES (Lower Impact, Higher Effort)

### 📌 Task 9: Improve Alias Popover Positioning
**File:** `src-2.0/components/ValueRenderer.tsx` (calculatePosition function)
**Description:** Refine algorithm to prevent popovers from overlapping content or going off-screen
**Changes:**
- Better viewport boundary detection
- Smart positioning for complex alias chains
- Reduce popover flickering
- Optimize positioning performance
**Impact:** Better UX for complex alias chains
**Estimated Time:** 4 hours

### 📌 Task 10: Extend Search Across All View Modes
**Files:** `src-2.0/contexts/SearchContext.tsx` + view components
**Description:** Make search available in CSS and JSON views, not just table view
**Changes:**
- Modify search context to work with different data formats
- Add search highlighting in JSON/CSS views
- Update header logic to show search in all modes
**Impact:** Consistent experience across views
**Estimated Time:** 3 hours

### 💡 Task 11: Add JSON/CSS Syntax Highlighting
**Files:** `src-2.0/screens/Variables.tsx` (JSONView, CSSView functions)
**Description:** Add basic syntax highlighting for better readability
**Options:**
- Lightweight highlighting library
- Custom CSS-based highlighting
- Prism.js integration
**Impact:** Professional developer experience
**Estimated Time:** 2-4 hours (depending on approach)

### 💡 Task 12: Implement Keyboard Navigation
**Files:** Multiple components for focus management
**Description:** Add keyboard shortcuts and focus management
**Changes:**
- Tab navigation through interface
- Arrow key navigation in table
- Keyboard shortcuts for common actions (Cmd+F for search, Esc to close, etc.)
- Proper focus indicators
**Impact:** Power user efficiency, accessibility
**Estimated Time:** 6 hours

---

## 🎯 TIER 4: NICE-TO-HAVE ENHANCEMENTS

### 💡 Task 13: Add Right-Click Context Menus
**Description:** Context menus for quick actions on variables (copy, export, etc.)
**Estimated Time:** 4 hours

### 💡 Task 14: Implement Bulk Selection
**Description:** Allow multiple variable selection for batch operations
**Estimated Time:** 6 hours

### 💡 Task 15: Enhanced Filtering Options
**Description:** Advanced search with filters for variable types, collections, etc.
**Estimated Time:** 5 hours

---

## Implementation Strategy

### Phase 1 (Week 1): Foundation - Tier 1 Tasks
**Estimated Total Time:** 1 hour
**Expected Impact:** 80% of user satisfaction improvement

### Phase 2 (Week 2): Polish - Tier 2 Tasks  
**Estimated Total Time:** 8 hours
**Expected Impact:** Additional 15% improvement

### Phase 3 (Week 3+): Advanced - Tier 3 & 4 Tasks
**Estimated Total Time:** 15-30 hours
**Expected Impact:** Final 5% polish + power user features

## Testing Checklist
- [ ] Test all changes in both light and dark themes
- [ ] Verify responsive behavior at different window sizes
- [ ] Test keyboard navigation and accessibility
- [ ] Validate export functionality still works
- [ ] Check alias resolution popover positioning
- [ ] Test with long collection/variable names
- [ ] Verify search functionality across different data sets