# FischPedia Web Interface

A user-friendly web interface for managing the FischPedia community fish database.

## Features

- **Add Fish Form**: Easy-to-use form for adding new fish entries
- **Data Format Generator**: Automatically generates the correct pipe-delimited format
- **View Database**: Browse all fish currently in the database
- **GitHub Integration**: Direct links to edit data on GitHub
- **Real-time Updates**: Loads data directly from GitHub

## Usage

### Option 1: GitHub Pages (Recommended)

1. Push the `web` folder to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to `/web` folder
4. Access at: `https://yourusername.github.io/fischhelper/`

### Option 2: Local Development

1. Open `index.html` in a web browser
2. Use a local server to avoid CORS issues:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (with http-server)
   npx http-server -p 8000
   ```
3. Navigate to `http://localhost:8000`

### Option 3: Standalone File

Simply open `index.html` in your browser (some features may be limited due to CORS).

## How It Works

1. **Add Fish Tab**: Fill out the form with fish information
2. **Generate Format**: Click the button to generate the formatted data string
3. **Submit to GitHub**: Use the provided link to edit the file on GitHub
4. **Create Pull Request**: GitHub will guide you through creating a PR
5. **Community Review**: Your contribution will be reviewed and merged

## Data Format

The interface generates data in the following format:
```
fishname|rarity|location|value|powerRequired|speed|controlNeeded|notes|bestTime
```

## Customization

To use with a different GitHub repository, update the `GITHUB_REPO` constant in `app.js`:

```javascript
const GITHUB_REPO = 'yourusername/yourrepo';
```

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with JavaScript enabled

## Contributing

Feel free to improve the web interface! Some ideas:
- Add fish editing capabilities
- Implement direct GitHub API integration
- Add data validation
- Improve mobile responsiveness
- Add search/filter functionality

