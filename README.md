# FischHelper - In-Game Fishing Overlay for Roblox

A community-driven fishing helper overlay that displays rod stats and provides a searchable fish database (FischPedia) directly in-game.

## Features

- **Auto-Detection**: Automatically hooks onto Roblox when launched
- **In-Game Overlay**: Transparent overlays that don't interfere with gameplay
- **Rod Stats Display**: Bottom-left display showing calculated stats including:
  - Control, Power, Speed, Durability, Luck
  - Weather bonuses
  - Pot effects
  - Friend bonus XP
- **FischPedia**: Searchable fish database accessible via F1 keybind
- **GitHub Integration**: Community-driven database that auto-updates on launch
- **No Automation**: Pure information tool - no macros or automation

## Installation

1. Download `FischHelper.ahk`
2. Install [AutoHotkey v1.1](https://www.autohotkey.com/download/ahk-install.exe)
3. Run `FischHelper.ahk`
4. Launch Roblox - the overlay will automatically activate

## Usage

### Hotkeys
- **F1**: Toggle Fish Search (FischPedia)
- **F2**: Open Settings
- **ESC**: Close Fish Search

### Settings
- Configure your base rod stats (Control, Power, Speed, Durability, Luck)
- Set weather conditions and pot types
- Enter friend bonus percentage
- Configure GitHub repository for updates

### Rod Stats Display
The bottom-left overlay automatically calculates and displays:
- Final stats with weather and pot bonuses applied
- Current weather and pot status
- Friend bonus percentage

### FischPedia
Press F1 to open the fish search interface on the right side:
- Search by fish name, location, or rarity
- Click any fish to view detailed information
- Data automatically syncs from GitHub on launch

## Contributing to the Fish Database

The fish database is community-driven! To add or update fish information:

1. Fork this repository
2. Edit `data/fishdata.json`
3. Follow the format: `fishname|rarity|location|value|powerRequired|speed|controlNeeded|notes|bestTime`
4. Submit a pull request

### Data Format
```
fishname|rarity|location|value|powerRequired|speed|controlNeeded|notes|bestTime
```

Example:
```
Tuna|Rare|Ocean|50|25|Very Fast|15|Deep ocean fish, requires high stats|Night
```

## GitHub Setup

1. Fork this repository
2. Update `GitHubRepo` in the settings to match your repository
3. The script will automatically check for updates on launch

## Requirements

- Windows 10/11
- AutoHotkey v1.1
- Roblox Player (not Microsoft Store version)
- Display Scale set to 100% (recommended)

## License

This project is open source and available for community use and modification.

## Disclaimer

This tool is for informational purposes only. It does not automate gameplay or violate Roblox's Terms of Service.
