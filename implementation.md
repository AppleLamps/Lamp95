# Implementation Guide for Lamp95 Enhancements

## Introduction for AI Assistant

**Your Tasks and Goals:**  
You are tasked with enhancing the Lamp95 Windows 95 simulator project by implementing new features to improve functionality, user experience, and immersion. The codebase is a TypeScript-based web app using Vite, with a desktop interface, window management, and various apps like paint, minesweeper, and chat. Your goal is to follow this step-by-step guide to add the specified features, ensuring each step is completed accurately and the code remains maintainable, type-safe, and aligned with the retro Windows 95 theme.

**Key Reminders:**  

- Always review the existing codebase (e.g., `src/windowManager.ts`, `src/apps/`, `index.html`, `index.css`) before making changes to understand current implementations and avoid conflicts.  

- Use tools like `read_file`, `replace_string_in_file`, and `insert_edit_into_file` to make precise edits.  

- Test changes by running the dev server (`npm run dev`) and checking the UI at `http://localhost:3001/`.  

- Prioritize modular code: Add new files in appropriate directories (e.g., `src/apps/` for new apps, `src/components/` for reusable components).  

- Ensure TypeScript types are used consistently (reference `src/types.ts`).  

- **Always check off a task when done:** After completing a step, update this file by changing `[ ]` to `[x]` for that checkbox. This tracks progress and ensures nothing is missed.  

- If a step requires multiple sub-steps, break it down and check off individually.  

- Update dependencies in `package.json` if needed, and run `npm install` after changes.  

- Commit changes incrementally for version control.

## Feature 1: Add More Desktop Icons and Apps (e.g., Calculator)

**Goal:** Introduce additional classic Windows 95 apps like a Calculator to increase immersion and interactivity.

- [x] **Step 1.1:** Create a new app file `src/apps/calculatorApp.ts` with basic calculator logic (addition, subtraction, multiplication, division). Use HTML elements for display and buttons, styled to match Windows 95 theme. Include functions like `initCalculator(windowElement)` for initialization.  
- [x] **Step 1.2:** Update `src/config.ts` to add calculator icon URL and title (e.g., `calculator: 'https://example.com/calculator-icon.png'`, `Calculator: 'Calculator'`).  
- [x] **Step 1.3:** Add a calculator window div in `index.html` (inside `<div id="desktop">`), similar to existing windows (e.g., `<div class="window resizable" id="calculator">...</div>`). Include titlebar, content area with display and button grid.  
- [x] **Step 1.4:** Update `src/windowManager.ts` in the `openApp` function to handle 'calculator' case: Import and call `initCalculator(windowElement)`.  
- [x] **Step 1.5:** Add a desktop icon in `index.html` for calculator (e.g., `<div class="icon" data-app="calculator">...</div>`).  
- [x] **Step 1.6:** Test the calculator app: Open it from desktop, perform calculations, ensure it closes/minimizes properly.  

## Feature 2: Implement Window Management Features (Enhance Minimize/Maximize/Close/Taskbar)

**Goal:** Improve window management with maximize functionality and better taskbar integration, as minimize/close/taskbar are partially implemented.  
**Estimated Effort:** Medium (2-3 hours).  

- [x] **Step 2.1:** Add maximize button to window titlebars in `index.html` (e.g., add `<div class="window-maximize window-control-button">□</div>` next to minimize/close).  
- [x] **Step 2.2:** Update `src/windowManager.ts` to add `maximizeApp(appName)` function: Toggle window size between normal and maximized (full screen minus taskbar). Track maximized state in `AppData` interface.  
- [x] **Step 2.3:** In `index.tsx`, add event listeners for maximize buttons: Call `maximizeApp(windowElement.id)` on click.  
- [x] **Step 2.4:** Enhance taskbar: Allow right-click on taskbar apps for context menu (e.g., Close, Minimize). Add CSS in `index.css` for taskbar app hover effects.  
- [x] **Step 2.5:** Update `src/types.ts` to extend `AppData` with `isMaximized: boolean`.  
- [x] **Step 2.6:** Test window management: Maximize/restore windows, use taskbar to switch/minimize, ensure z-index and active states work.  

## Feature 3: Add Sound Effects and Animations

**Goal:** Add nostalgic sound effects (e.g., startup, clicks) and smooth animations (e.g., window open/close) for better immersion.  
**Estimated Effort:** Low-Medium (1-2 hours).  

- [x] **Step 3.1:** Add sound files to `public/sounds/` (e.g., `startup.wav`, `click.wav`). Use free Windows 95 sound assets or generate simple ones.  
- [x] **Step 3.2:** Create `src/utils/soundManager.ts` with functions like `playSound(soundName)` using `new Audio()`.  
- [x] **Step 3.3:** Integrate sounds: In `index.tsx`, play startup sound on load. In `openApp`/`closeApp`, play open/close sounds.  
- [x] **Step 3.4:** Add animations: In `index.css`, add CSS transitions (e.g., `transition: opacity 0.3s ease;` for window visibility). Use keyframes for window slide-in effects.  
- [x] **Step 3.5:** Update `src/windowManager.ts` to trigger animations on open/close (e.g., add/remove CSS classes).  
- [x] **Step 3.6:** Test: Ensure sounds play on interactions, animations are smooth, and no performance issues.  

## Feature 4: Integrate a Clock and Date Display

**Goal:** Add a live clock in the taskbar showing current time and date.  
**Estimated Effort:** Low (30-60 minutes).  

- [x] **Step 4.1:** Create `src/components/Clock.tsx` with a React component using `useState` and `setInterval` to update time every second. Display format like "HH:MM AM/PM - MM/DD/YYYY".  
- [x] **Step 4.2:** Add clock div to taskbar in `index.html` (e.g., `<div id="taskbar-clock"></div>`).  
- [x] **Step 4.3:** In `index.tsx`, render the Clock component into `#taskbar-clock` using ReactDOM or similar.  
- [x] **Step 4.4:** Style the clock in `index.css` to match taskbar (e.g., font, color).  
- [x] **Step 4.5:** Test: Verify clock updates in real-time and displays correctly.

## Feature 5: Add Themes or Customization Options

**Goal:** Allow users to switch color schemes (e.g., default gray, high contrast) via a settings window.  
**Estimated Effort:** Medium (1-2 hours).  

- [ ] **Step 5.1:** Create `src/apps/settingsApp.ts` with theme options (e.g., dropdown for themes). Use localStorage to persist choice.  
- [ ] **Step 5.2:** Add settings window in `index.html` and icon on desktop. Update `src/config.ts` and `src/windowManager.ts` for settings app.  
- [ ] **Step 5.3:** Define CSS variables in `index.css` (e.g., `--bg-color: #C0C0C0;`). Create theme classes (e.g., `.theme-high-contrast { --bg-color: black; }`).  
- [ ] **Step 5.4:** In `settingsApp.ts`, apply theme by adding class to `document.body` and saving to localStorage.  
- [ ] **Step 5.5:** Load theme on app start in `index.tsx` (check localStorage and apply).  
- [ ] **Step 5.6:** Test: Switch themes, ensure persistence across reloads, and UI updates correctly.  

## Feature 6: Improve Responsiveness and Mobile Support

**Goal:** Optimize for mobile devices with better touch handling and responsive layouts.  

- [x] **Step 6.1:** Update `index.css` media queries for mobile (e.g., smaller icons, stacked taskbar). Adjust window sizes and touch targets.  
- [x] **Step 6.2:** Enhance touch events in `src/apps/paintApp.ts` (already has some, ensure smooth drawing on mobile).  
- [x] **Step 6.3:** In `index.tsx`, add mobile-specific event listeners (e.g., prevent default on touch for better scrolling).  
- [x] **Step 6.4:** Test on mobile: Use browser dev tools to simulate touch, check window dragging, app interactions.  
- [x] **Step 6.5:** Add viewport meta tag in `index.html` if missing (e.g., `<meta name="viewport" content="width=device-width, initial-scale=1">`).  
- [x] **Step 6.6:** Final test: Ensure desktop still works, mobile is usable without zoom issues.  

## Final Steps

- [ ] **Run full tests:** After all features, run `npm test`, check for errors with `get_errors`, and preview in browser.  
- [ ] **Update README.md:** Document new features and usage.  
- [ ] **Commit and push:** Ensure all changes are version-controlled.  

Remember, check off each step as completed to maintain progress tracking!
