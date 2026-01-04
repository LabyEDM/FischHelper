# GitHub Issue Setup

## How It Works

The workflow (`process_issue.yml`) will automatically run when:
- An issue is opened or edited
- AND the issue title starts with "Add Fish:"

**Note:** The web interface automatically sets the title to "Add Fish: [fish name]", so the workflow will trigger automatically.

The workflow will:
1. Extract the fish data from the issue body
2. Update `data/fishdata.json` (adds or updates the entry)
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

