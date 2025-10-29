# Contributing to Countries Quiz Extension

Thank you for your interest in contributing to the Countries Quiz Extension! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Setup

1. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension directory

2. Make your changes to the code

3. Reload the extension in Chrome to test changes

## Project Structure

```
countries-quiz-extension/
├── manifest.json              # Extension configuration
├── popup.html                 # Main popup interface
├── popup.js                   # Main application logic
├── styles.css                 # Styling
├── background.js              # Background service worker
├── settings.html              # Settings page
├── stats.html                 # Statistics page
├── js/
│   ├── constants.js           # Application constants
│   ├── storage-manager.js     # Chrome Storage operations
│   ├── sound-manager.js       # Sound effects
│   ├── ui-manager.js          # UI rendering and updates
│   └── quiz-engine.js         # Quiz logic
├── data/
│   ├── countries.js           # Countries database
│   ├── regions.js             # Region mappings
│   └── facts.js               # Fun facts about countries
└── images/                    # Extension icons
```

## Code Style

- Use 2 spaces for indentation
- Use camelCase for variable and function names
- Use PascalCase for class names
- Add JSDoc comments for functions
- Keep functions small and focused
- Follow existing code patterns

## Adding New Features

When adding a new feature:

1. Update the relevant module files
2. Add appropriate error handling
3. Update UI if necessary
4. Test thoroughly in both light and dark themes
5. Ensure accessibility (ARIA labels, keyboard navigation)
6. Update documentation if needed

## Adding Countries Data

To add or update country information:

1. Edit `data/countries.js` for basic country data (name, capital, flag)
2. Edit `data/regions.js` to add region and difficulty information
3. Edit `data/facts.js` to add fun facts

Ensure all data follows the existing format:

```javascript
// countries.js
{
  name: "Country Name",
  capital: "Capital City",
  flag: "https://flagcdn.com/xx.svg"
}

// regions.js
"Country Name": {
  region: "Continent",
  subregion: "Sub-region",
  difficulty: "easy|medium|hard"
}

// facts.js
"Country Name": "Interesting fact about the country."
```

## Testing

Before submitting a PR, please test:

1. All three quiz types (Capitals, Flags, Countries)
2. Settings page functionality
3. Statistics page accuracy
4. Dark mode appearance
5. Timer functionality (if enabled)
6. Sound effects (if enabled)
7. Review mode
8. Data export
9. Keyboard navigation
10. Different screen sizes

## Reporting Bugs

When reporting a bug, please include:

- Chrome version
- Extension version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Console errors (if any)

## Suggesting Enhancements

We welcome enhancement suggestions! Please:

1. Check if the suggestion already exists in issues
2. Clearly describe the enhancement
3. Explain why it would be useful
4. Provide examples or mockups if possible

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure all tests pass
3. Update version number in manifest.json following [Semantic Versioning](https://semver.org/)
4. Provide a clear description of changes in the PR
5. Link any related issues

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards others

## Questions?

Feel free to open an issue with the "question" label if you have any questions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
