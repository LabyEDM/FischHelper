# GitHub Issue Setup

## Creating the "fish-entry" Label

For the workflow to automatically process issues, you should create a label called `fish-entry`:

1. Go to your repository: https://github.com/LabyEDM/FischHelper
2. Click on **Issues** → **Labels**
3. Click **New label**
4. Name: `fish-entry`
5. Description: `Issues for adding new fish entries to the database`
6. Color: Choose a color (e.g., `#0e8a16` for green)
7. Click **Create label**

## How It Works

The workflow (`process_issue.yml`) will automatically run when:
- An issue is opened or edited
- AND either:
  - The issue has the `fish-entry` label, OR
  - The issue title starts with "Add Fish:"

The workflow will:
1. Extract the fish data from the issue body
2. Update `data/fishdata.json`
3. Commit and push the changes
4. Comment on the issue confirming success
5. Close the issue automatically

## Issue Format

The web interface automatically creates issues in the correct format. The issue body should contain:

```
## Add Fish to Database

**Fish Name:** [name]
**Rarity:** [rarity]
...

**Formatted Entry:**
```
fishname|rarity|location|value|powerRequired|speed|controlNeeded|notes|bestTime
```
```

The workflow extracts the entry from the code block in the "Formatted Entry" section.

## Testing

To test the workflow:
1. Use the web interface to create a test issue
2. Or manually create an issue with title "Add Fish: TestFish"
3. The workflow should run automatically
4. Check the Actions tab to see the workflow status

