# Technical Specifications: How It Works Page

**Status:** Ready for Dev
**Reference:** [Design Mockup](file:///c:/Users/Carniatto/DEV/PokerPlanningNeo/docs/assets/how_it_works_full.png)

## 🎯 Goal
Implement a premium, full-screen carousel module to explain the Poker Planning process.

## 🖼️ UI Requirements

### 1. Layout & Container
-   **Full Screen Overlay:** The component should take up the entire viewport (`100vw`, `100vh`).
-   **Background:** Deep Navy (`#030b17` to `#0a192f` gradient) to match the "Neo" aesthetic.
-   **Centering:** Content (Image + Text) should be vertically and horizontally centered.

### 2. Carousel Content
-   **Split Layout:**
    -   **Left:** Key Visual (Puzzle pieces, Cards, etc.) with a subtle outer glow/shadow.
    -   **Right:** Text Content.
        -   **Heading:** Large, Bold, White (e.g., "4. Converge").
        -   **Body:** Medium gray (`#8892b0`), readable max-width.

### 3. Controls
-   **Navigation Buttons:**
    -   Floating circles on the far left/right edges.
    -   Translucent background (`rgba(255,255,255,0.1)`) with hover effect.
-   **Pagination Dots:**
    -   Bottom center.
    -   Active dot: Bright Blue (`#3b82f6`).
    -   Inactive dots: Dark Gray.

## 🛠️ Implementation Strategy

### Component
-   **File:** `src/app/how-it-works/how-it-works.component.ts` (and `.html`, `.css`)
-   **Logic:**
    -   Use `@if` / `@for` for rendering slides.
    -   Animations: Use Angular Animations (`@angular/animations`) for smooth sliding/fading between steps.

### Assets
-   Ensure high-quality images are used for the slide visuals. Use placeholders if specific assets aren't provided yet.

## 🧪 Testing Plan (Playwright)
-   **File:** `tests/e2e/how-it-works.spec.ts`
-   **Scenarios:**
    1.  Open "How it Works" from Home.
    2.  Verify Title and Image are visible.
    3.  Click "Next" -> Verify Slide 2 appears.
    4.  Click "Previous" -> Verify Slide 1 appears.
    5.  Click "Close" -> Verify return to Home.
