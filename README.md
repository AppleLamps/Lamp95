# Lamp95 - Retro Windows 95 Simulator

A nostalgic recreation of the classic Windows 95 desktop environment, built with modern web technologies. Experience the retro UI with contemporary features including AI-powered apps, responsive design, and accessibility enhancements.

## ✨ Features

- **Classic Windows 95 Interface**: Authentic retro desktop with taskbar, start menu, and window management
- **Built-in Apps**:
  - **GemPaint**: Drawing app with AI critique feature
  - **GemSweeper**: Classic Minesweeper with AI hints
  - **Gemini Chat**: AI-powered chat interface
  - **GemPlayer**: YouTube video player
  - **Chrome Browser**: Embedded web browser
  - **My Computer**: File explorer simulation
  - **Notepad**: Text editor with AI story generation
- **AI Integration**: Powered by Google's Gemini AI for chat, hints, and creative features
- **Responsive Design**: Optimized for desktop and mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Performance Optimized**: Lazy loading, caching, and efficient rendering

## 🚀 Technologies

- **Frontend**: TypeScript, React, Vite
- **Styling**: TailwindCSS
- **AI**: @google/genai (Gemini API)
- **Testing**: Vitest with jsdom
- **Build**: Vite with code splitting and minification

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Gemini API key from [Google AI Studio](https://ai.google.dev/)

## 🛠️ Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/AppleLamps/Lamp95.git
   cd Lamp95
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:3000`

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

## 📦 Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🎯 Recent Enhancements

- **Performance**: Optimized rendering with DOM batching and debounced resize observers
- **Security**: Enhanced error handling with user-friendly messages
- **Accessibility**: Added ARIA labels, keyboard navigation, and mobile responsiveness
- **Testing**: Comprehensive unit tests for core functionality
- **Build**: Code splitting and minification for optimized production bundles

## 📄 Project Structure

```text
Lamp95/
├── src/
│   ├── apps/          # Individual app modules
│   ├── windowManager.ts # Window management system
│   ├── ai.ts          # AI utilities and caching
│   ├── config.ts      # Configuration constants
│   ├── types.ts       # TypeScript interfaces
│   └── __tests__/     # Unit tests
├── index.html         # Main HTML template
├── index.tsx          # React entry point
├── vite.config.ts     # Build configuration
└── package.json       # Dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the classic Windows 95 interface
- Built with modern web technologies for educational and nostalgic purposes
- AI features powered by Google's Gemini API
