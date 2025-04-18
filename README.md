# Countries Quiz Chrome Extension

A fun and educational Chrome extension that tests your knowledge of countries, capitals, and flags from around the world.

## Features

- **Three Quiz Types**:
  - **Capitals**: Guess the capital city of a country
  - **Flags**: Identify which country a flag belongs to
  - **Countries**: Match the correct flag to a country

- **Comprehensive Database**: Contains data for 195+ countries, including their capitals and flags
- **Score Tracking**: Keeps track of your correct answers
- **Responsive Design**: Clean, modern interface that works well in the Chrome browser

## Installation

Since this extension is not yet published on the Chrome Web Store, you'll need to install it in developer mode:

1. Download or clone this repository to your computer
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the `countries-quiz-extension` folder
5. The extension should now appear in your extensions list and be available from the toolbar

## How to Generate Icons

If you need to generate the extension icons:

1. Open the `icon-generator.html` file in a web browser
2. Click the "Generate Icons" button to create the icons
3. Click the "Download Icons" button to download the icon files
4. Move the downloaded icon files to the `images` folder in the extension directory

## How to Use

1. Click on the Countries Quiz icon in your Chrome toolbar to open the quiz
2. Select a quiz type using the buttons at the bottom (Capitals, Flags, or Countries)
3. Answer the question by clicking on one of the options
4. Click "Next Question" to continue with a new question
5. Your score will be saved automatically

## Development

### Project Structure

```
countries-quiz-extension/
├── manifest.json         # Extension configuration
├── popup.html            # Main extension popup
├── popup.js              # Quiz logic
├── styles.css            # Styling
├── background.js         # Background script for initialization
├── data/
│   └── countries.js      # Database of countries, capitals, flags
└── images/
    ├── icon16.png        # Extension icons
    ├── icon48.png
    └── icon128.png
```

### Technology Used

- HTML5, CSS3, and JavaScript
- Chrome Extension API
- Canvas for icon generation

## Future Enhancements

- Add different difficulty levels
- Include more detailed information about each country
- Add a "Learn Mode" that provides educational content
- Implement statistics tracking to show progress over time
- Add support for multiple languages

## Credits

- Flag images provided by [flagcdn.com](https://flagcdn.com)
- Country and capital data compiled from multiple sources

## License

This project is licensed under the MIT License - see the LICENSE file for details. 