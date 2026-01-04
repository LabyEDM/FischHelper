# FischPedia Data Files

This directory contains the community-driven fish database.

## File Format

The `fishdata.json` file uses a simple pipe-delimited format:

```
fishname|rarity|location|value|powerRequired|speed|controlNeeded|notes|bestTime
```

### Field Descriptions

- **fishname**: Name of the fish
- **rarity**: Common, Uncommon, Rare, Epic, Legendary
- **location**: Where the fish can be found (Freshwater, Ocean, Any, etc.)
- **value**: Base value/price of the fish
- **powerRequired**: Minimum power stat needed
- **speed**: Speed category (Very Slow, Slow, Medium, Fast, Very Fast, Extreme)
- **controlNeeded**: Minimum control stat needed
- **notes**: Additional information about the fish
- **bestTime**: Best time of day to catch (optional)

### Adding New Fish

Simply add a new line following the format above. Example:

```
Angelfish|Rare|Ocean|45|22|Fast|12|Beautiful tropical fish|Day
```

### Contributing

1. Edit `fishdata.json`
2. Follow the format exactly
3. Test your entry
4. Submit a pull request

The community will review and merge valid entries!

