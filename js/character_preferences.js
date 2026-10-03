// Character preference bridge.
// This is the only file that should need editing for simple player preferences.
// Example: MGO_CHARACTER_PREFS.overrides.blueSpeedster.jersey = 0xff3355;
// Rebuild with updateCharacterAppearance(player, MGO_CHARACTER_PREFS.overrides.blueSpeedster).

const MGO_CHARACTER_PREFS = {
  "default": "blueSpeedster",
  "allowedTypes": ["human","cap","duck","bheem","raju","ninja","sonic","panda","robot"],
  "overrides": {
    "blueSpeedster": {
      "name": "Blue Speedster",
      "skin": 0xe8b98c,
      "jersey": 0x2563eb,
      "dark": 0x123a9a,
      "hair": 0x1769e0,
      "accent": 0xf8fafc,
      "shoe": 0xe53935
    }
  }
};

function getCharacterPreferences(characterId, overrides = {}) {
  const configured = MGO_CHARACTER_PREFS.overrides?.[characterId] || {};
  return { ...configured, ...overrides };
}
