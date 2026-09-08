# Countries Quiz Chrome Extension

A comprehensive and educational Chrome extension that tests your knowledge of countries, capitals, and flags from around the world with advanced features and detailed statistics.

Version 2.1.1 improves extension compatibility, scoring reliability, review behavior, keyboard controls, and popup layout. See [quality checks and remaining release work](docs/QUALITY.md) for the verified scope and limitations.

## ✨ Features

### Quiz Modes
- **Capitals Quiz**: Identify the capital city of a given country
- **Flags Quiz**: Recognize which country a flag belongs to
- **Countries Quiz**: Match the correct flag to a country name

### Smart Scoring System
- **Accuracy Percentage**: Track your overall performance
- **Streak Counter**: See how many consecutive correct answers you've achieved
- **Detailed Statistics**: View correct/total questions answered
- **Per-Country Analytics**: Identify which countries you struggle with

### Difficulty & Region Filters
- **Three Difficulty Levels**: Easy, Medium, and Hard
- **Regional Filtering**: Focus on specific continents (Africa, Asia, Europe, Americas, Oceania)
- **Smart Categorization**: Countries are automatically categorized by difficulty and region

### Advanced Features
- **Timed Mode**: Optional countdown timer (5-60 seconds per question)
- **Review Mode**: Practice missed questions to improve your knowledge
- **Dark Mode**: Easy on the eyes with a beautiful dark theme
- **Sound Effects**: Audible feedback for correct/incorrect answers (can be disabled)
- **Fun Facts**: Learn interesting facts about countries after each answer
- **Keyboard Navigation**: Full keyboard support with ARIA labels for accessibility

### Statistics & Progress Tracking
- **Comprehensive Stats Page**: View detailed performance metrics
- **Quiz History**: See your last 50 quiz attempts
- **Performance by Quiz Type**: Track accuracy for each quiz mode separately
- **Country-Specific Stats**: Identify your weakest areas
- **Data Export**: Download your quiz data as JSON

### UI/UX Improvements
- **Loading States**: Smooth transitions and loading indicators
- **Animations**: Satisfying visual feedback for correct/incorrect answers
- **Responsive Design**: Optimized for different screen sizes
- **Accessibility**: Screen reader support, keyboard navigation, reduced motion support

## 🚀 Installation

Since this extension is not yet published on the Chrome Web Store, you'll need to install it in developer mode:

1. Download or clone this repository to your computer
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the `countries-quiz-extension` folder
5. The extension should now appear in your extensions list and be available from the toolbar

## 📖 How to Use

### Basic Usage
1. Click the Countries Quiz icon in your Chrome toolbar
2. Select a quiz type (Capitals, Flags, or Countries)
3. Answer questions by clicking on options or using keyboard navigation
4. Click "Next Question" to continue
5. Your progress is saved automatically

### Settings
Click the ⚙️ settings icon to configure:
- **Difficulty Level**: Choose which countries to include
- **Region Filter**: Focus on specific continents
- **Timed Mode**: Enable countdown timer
- **Theme**: Switch between light and dark mode
- **Sound Effects**: Toggle audio feedback

### Statistics
Click the 📊 stats icon to view:
- Overall accuracy and streak
- Performance breakdown by quiz type
- Recent quiz history
- Countries you struggle with most

### Review Mode
Click the 📝 review icon to practice questions you've answered incorrectly.

## 🏗️ Project Structure

```
countries-quiz-extension/
├── manifest.json              # Extension configuration (v3)
├── popup.html                 # Main popup interface
├── popup.js                   # Main application logic
├── styles.css                 # Enhanced styling with dark mode
├── background.js              # Background service worker
├── settings.html              # Settings page
├── stats.html                 # Statistics page
├── js/
│   ├── constants.js           # Application constants
│   ├── storage-manager.js     # Chrome Storage API wrapper
│   ├── sound-manager.js       # Web Audio API sound effects
│   ├── ui-manager.js          # UI rendering and updates
│   └── quiz-engine.js         # Quiz logic and game flow
├── data/
│   ├── countries.js           # 195+ countries database
│   ├── regions.js             # Region and difficulty mappings
│   └── facts.js               # Fun facts about countries
├── images/                    # Extension icons
├── LICENSE                    # MIT License
├── CONTRIBUTING.md            # Contribution guidelines
├── .eslintrc.json            # ESLint configuration
└── .prettierrc.json          # Prettier configuration
```

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (with CSS Variables), JavaScript (ES6+)
- **APIs**: Chrome Extension API (Manifest V3), Web Audio API
- **Storage**: Chrome Storage API (local)
- **Data**: Flag images from [flagcdn.com](https://flagcdn.com)
- **Code Quality**: Automated syntax/CSP checks, Node regression tests, and Playwright extension smoke tests
- **Architecture**: Modular JavaScript with separation of concerns

## 🎨 Technical Highlights

- **Modular Architecture**: Clean separation of concerns (Storage, UI, Quiz Engine, Sound)
- **Error Handling**: Comprehensive try-catch blocks and error recovery
- **Accessibility**: Native keyboard controls, focus indicators, live feedback, and reduced-motion support; a full WCAG audit is still pending
- **Performance**: Efficient data structures and lazy loading
- **Security**: Content Security Policy for external resources
- **Progressive Enhancement**: Works without sound, with reduced motion, etc.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:
- Setting up the development environment
- Code style and standards
- Adding new features
- Submitting pull requests
- Reporting bugs

## 📝 Changelog

### Version 2.1.1 (Current)
- Fixed settings and statistics scripts blocked by Manifest V3 CSP.
- Made answer submission single-use and moved persistence to the background worker.
- Serialized storage updates across extension pages to prevent lost scores.
- Fixed review duplicates, empty-review startup, stale mode attribution, and timer validation.
- Added a compact, keyboard-accessible popup with visible navigation controls.
- Repaired four country-to-region metadata joins and supported small nonempty filters.
- Added reproducible automated checks and GitHub Actions CI.

### Version 2.0.0
- ✨ Added difficulty levels and region filters
- ✨ Implemented comprehensive statistics tracking
- ✨ Added dark mode support
- ✨ Introduced timed mode with countdown timer
- ✨ Created review mode for missed questions
- ✨ Added sound effects with Web Audio API
- ✨ Included fun facts about countries
- ✨ Built settings page for customization
- ✨ Enhanced accessibility with ARIA labels and keyboard navigation
- ✨ Improved scoring system (streak + accuracy tracking)
- 🐛 Fixed score reset bug on extension updates
- 🔧 Refactored codebase into modular architecture
- 🎨 Redesigned UI with better visual feedback
- 📊 Added detailed statistics and export functionality

### Version 1.0.0
- Initial release with basic quiz functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- Flag images provided by [flagcdn.com](https://flagcdn.com)
- Country, capital, and regional data compiled from multiple sources
- Fun facts curated from various educational resources

## 🌟 Support

If you find this extension helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs or suggesting features via Issues
- 🤝 Contributing code improvements
- 📢 Sharing with friends who love geography

---

**Made with ❤️ for geography enthusiasts worldwide**
