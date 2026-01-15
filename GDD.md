# Game Design Document: Block Blast Variant

## Project Overzicht

Een Block Blast-achtige puzzelgame met unieke mechanics die het origineel verbeteren. Gebouwd in Expo/React Native voor iOS en Android.

---

## Core Gameplay (Zoals Block Blast)

### Het Speelveld
- **Grid:** 8x8 vakjes
- **Start:** Leeg grid

### Blokken
- Onderaan verschijnen altijd **3 shapes** tegelijk
- Shapes zijn Tetris-achtige vormen (L, T, vierkant, lijn, etc.)
- **Blokken kunnen NIET geroteerd worden** (behalve met token, zie nieuwe mechanics)
- **Geen gravity:** blokken blijven waar je ze plaatst

### Hoe je speelt
1. Sleep een shape naar het grid
2. Plaats waar het past
3. Na elke 3 geplaatste shapes krijg je 3 nieuwe shapes

### Clearen
- Een volledige rij OF kolom vullen = clear
- Alle blokken in die rij/kolom verdwijnen
- Meerdere rijen/kolommen tegelijk clearen = meer punten

### Game Over
- Als geen van je 3 shapes meer past op het grid = einde

---

## Scoring Systeem

### Basis Punten
- **10 punten** per blok dat verdwijnt
- Rij van 8 blokken clearen = 80 punten

### Streak Systeem (CRUCIAAL)

**Definitie:**
- Elke clear (rij of kolom) telt als +1 op je streak
- Je streak blijft behouden ZOLANG je binnen elke 3 plaatsingen minstens 1 clear maakt
- Miss je een volledige ronde van 3 plaatsingen zonder clear? **Streak reset naar 0**

**Streak Multiplier:**
| Streak | Multiplier |
|--------|------------|
| 1-9    | 1x         |
| 10-19  | 2x         |
| 20-29  | 3x         |
| 30-39  | 4x         |
| 40-49  | 5x         |
| 50+    | 6x (max)   |

### Strategische Diepte van Streak

**De pro-strategie:**
```
Je hebt: Shape A, B, C
Je KAN clearen met Shape A

❌ Beginner move:
   - Speelt A → cleart → streak +1
   - Speelt B → geen clear
   - Speelt C → geen clear
   - Krijgt nieuwe shapes D, E, F
   - MOET binnen 2 zetten clearen (want 1 "lege" beurt over van vorige ronde)
   - Weet niet of D, E, F kunnen clearen → RISICO

✅ Pro move:
   - Speelt B → geen clear
   - Speelt C → geen clear
   - Speelt A → cleart → streak +1
   - Krijgt nieuwe shapes D, E, F
   - Heeft nu weer VOLLE 3 zetten om te clearen
   - Ziet alle 3 nieuwe shapes → kan plannen → CONTROLE
```

**Waarom dit werkt:**
- Na een clear reset je "clear window" naar 3 zetten
- Door als LAATSTE te clearen begin je elke ronde met maximale info
- Je staat nooit voor verrassingen met onbekende shapes

---

## Nieuwe Mechanics

### 1. Rotate Token 🔄

**Hoe je het verdient:**
- Bereik een streak van **20+** = verdien 1 rotate token

**Regels:**
- Maximum **3 tokens** tegelijk opsparen
- Gebruik wanneer je wilt
- **Tap op een shape** om het 90° te roteren
- Token is daarna op

**Waarom dit waardevol is:**
- Block Blast staat normaal GEEN rotatie toe
- Een token kan je redden uit een onmogelijke situatie
- Tokens zijn schaars → strategische keuze wanneer te gebruiken

**UI Indicatie:**
- Toon tokens rechtsboven (bijv. 🔄 🔄 ⚫ voor 2/3 tokens)
- Als je een token hebt, krijgen shapes een subtiele "tap to rotate" hint

---

### 2. Diamond Blocks 💎

**Hoe ze verschijnen:**
- Ongeveer elke **8-10 shapes** bevat er één een diamond blok
- Diamond blokken zitten IN de shape (bijv. een L-vorm met 1 diamond en 3 normale blokken)

**Puntenstructuur:**
| Situatie | Punten |
|----------|--------|
| Normaal blok in clear | 10 pts |
| Diamond blok in clear | 50 pts (5x) |
| Hele rij/kolom ALLEEN diamonds (8 stuks) | 500 pts bonus |

**Diamond rij + Streak combo:**
| Combo | Berekening | Totaal |
|-------|------------|--------|
| Diamond rij bij streak 20 (3x) | 500 × 3 | 1500 pts |
| Diamond rij bij streak 30 (4x) | 500 × 4 | 2000 pts |
| Diamond rij bij streak 50 (6x) | 500 × 6 | 3000 pts |

**De skill loop:**
```
Goed spelen
    ↓
Streak 20+ bereiken
    ↓
Verdien rotate token
    ↓
Gebruik token om diamond shape perfect te plaatsen
    ↓
Bouw naar volledige diamond rij
    ↓
Clear diamond rij met hoge streak
    ↓
MEGA PUNTEN
    ↓
Herhaal
```

**Waarom dit werkt:**
- Diamonds zijn zeldzaam genoeg om speciaal te voelen
- Volle diamond rij is moeilijk maar niet onmogelijk
- Combineert met streak systeem voor exponentiële beloning
- Twee mechanics die elkaar versterken

---

## Dopamine Triggers

### Streak Milestones (Visuele Feedback)

| Streak | Feedback |
|--------|----------|
| 10 | "🔥 ON FIRE" - scherm flitst, lichte glow |
| 20 | "⚡ UNSTOPPABLE" - confetti burst, token earned |
| 30 | "💀 GENERAL LIKE" - grid gloeit, epic sound |
| 50 | "👑 LEGENDARY" - full screen celebration |

**Visuele progressie:**
- Streak 0-9: Normaal speelveld
- Streak 10-19: Subtiele glow rond grid
- Streak 20-29: Blokken beginnen te gloeien
- Streak 30+: Particles, achtergrond kleurt, intensere muziek

### "Near Miss" Spanning

**Wanneer je 2 zetten hebt gedaan zonder clear:**
- Schermranden kleuren **rood**
- Subtiel **hartslag geluid**
- UI hint: "⚠️ 1 ZET OVER"

**Als je dan cleart:**
- **Opluchting sound effect**
- Rood verdwijnt instant
- Korte "safe" feedback

**Dit creëert de spanning → opluchting loop die verslavend werkt**

---

## Technische Specificaties

### Platform
- **Framework:** Expo / React Native
- **Target:** iOS en Android

### Grid Data Structuur

```javascript
// Grid state
const grid = Array(8).fill(null).map(() => Array(8).fill(null));

// Cell kan zijn:
// null = leeg
// { color: 'red' } = normaal blok
// { color: 'red', diamond: true } = diamond blok

// Voorbeeld filled cell:
grid[row][col] = {
  color: 'blue',
  diamond: false
};
```

### Shape Data Structuur

```javascript
// Shape definitie
const shapes = {
  L_SHAPE: {
    blocks: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
    ],
    rotations: 4, // Hoeveel unieke rotaties
  },
  SQUARE: {
    blocks: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    rotations: 1, // Vierkant is altijd hetzelfde
  },
  // etc...
};

// Active shape (wat speler heeft)
const activeShape = {
  type: 'L_SHAPE',
  color: 'red',
  currentRotation: 0, // 0-3
  hasDiamond: false,
  diamondIndex: null, // Welk blok is diamond (index in blocks array)
};
```

### Game State

```javascript
const gameState = {
  // Grid
  grid: [][], // 8x8

  // Current shapes (altijd 3)
  availableShapes: [shape1, shape2, shape3],

  // Tracking voor streak
  shapesPlacedThisRound: 0, // 0, 1, 2, of 3
  clearedThisRound: false,

  // Scores
  score: 0,
  streak: 0,
  highScore: 0,

  // Tokens
  rotateTokens: 0, // max 3

  // Game status
  isGameOver: false,
};
```

### Core Functions

```javascript
// Check of shape past op positie
function canPlaceShape(grid, shape, targetRow, targetCol) {
  for (const block of shape.blocks) {
    const row = targetRow + block.row;
    const col = targetCol + block.col;

    // Buiten grid?
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return false;

    // Al bezet?
    if (grid[row][col] !== null) return false;
  }
  return true;
}

// Plaats shape op grid
function placeShape(grid, shape, targetRow, targetCol, color, diamondIndex) {
  const newGrid = deepCopy(grid);

  shape.blocks.forEach((block, index) => {
    const row = targetRow + block.row;
    const col = targetCol + block.col;

    newGrid[row][col] = {
      color: color,
      diamond: index === diamondIndex,
    };
  });

  return newGrid;
}

// Check en clear complete rijen/kolommen
function checkAndClear(grid) {
  const rowsToClear = [];
  const colsToClear = [];

  // Check rijen
  for (let row = 0; row < 8; row++) {
    if (grid[row].every(cell => cell !== null)) {
      rowsToClear.push(row);
    }
  }

  // Check kolommen
  for (let col = 0; col < 8; col++) {
    let full = true;
    for (let row = 0; row < 8; row++) {
      if (grid[row][col] === null) {
        full = false;
        break;
      }
    }
    if (full) colsToClear.push(col);
  }

  // Bereken punten VOOR het clearen
  const clearedBlocks = [];

  rowsToClear.forEach(row => {
    for (let col = 0; col < 8; col++) {
      clearedBlocks.push(grid[row][col]);
    }
  });

  colsToClear.forEach(col => {
    for (let row = 0; row < 8; row++) {
      // Voorkom dubbel tellen als rij EN kolom
      if (!rowsToClear.includes(row)) {
        clearedBlocks.push(grid[row][col]);
      }
    }
  });

  // Clear de grid
  const newGrid = deepCopy(grid);

  rowsToClear.forEach(row => {
    for (let col = 0; col < 8; col++) {
      newGrid[row][col] = null;
    }
  });

  colsToClear.forEach(col => {
    for (let row = 0; row < 8; row++) {
      newGrid[row][col] = null;
    }
  });

  return {
    grid: newGrid,
    clearedCount: rowsToClear.length + colsToClear.length,
    clearedBlocks: clearedBlocks,
  };
}

// Bereken score voor cleared blocks
function calculateScore(clearedBlocks, streakMultiplier) {
  let score = 0;
  let diamondCount = 0;

  clearedBlocks.forEach(block => {
    if (block.diamond) {
      score += 50;
      diamondCount++;
    } else {
      score += 10;
    }
  });

  // Check voor full diamond rij (8 diamonds)
  if (diamondCount === 8) {
    score += 500; // Bonus
  }

  return score * streakMultiplier;
}

// Roteer shape
function rotateShape(shape) {
  // Roteer 90° clockwise
  const rotated = shape.blocks.map(block => ({
    row: block.col,
    col: -block.row + (maxRow), // Normalize
  }));

  // Normalize zodat minimum row/col = 0
  const minRow = Math.min(...rotated.map(b => b.row));
  const minCol = Math.min(...rotated.map(b => b.col));

  return rotated.map(block => ({
    row: block.row - minRow,
    col: block.col - minCol,
  }));
}

// Check game over
function isGameOver(grid, shapes) {
  // Check of ANY van de 3 shapes ERGENS past
  for (const shape of shapes) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (canPlaceShape(grid, shape, row, col)) {
          return false; // Minstens 1 move mogelijk
        }
      }
    }
  }
  return true; // Geen moves mogelijk
}

// Genereer nieuwe shapes (aangeroepen na elke 3 plaatsingen)
function generateNewShapes() {
  const shapeTypes = ['L_SHAPE', 'T_SHAPE', 'SQUARE', 'LINE_H', 'LINE_V', 'S_SHAPE', 'Z_SHAPE', 'SINGLE', 'SMALL_L'];
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  return [0, 1, 2].map(() => {
    const type = randomChoice(shapeTypes);
    const color = randomChoice(colors);

    // Diamond kans: ~1 op 8-10 shapes
    const hasDiamond = Math.random() < 0.12;
    const diamondIndex = hasDiamond
      ? Math.floor(Math.random() * shapes[type].blocks.length)
      : null;

    return {
      type,
      color,
      currentRotation: 0,
      hasDiamond,
      diamondIndex,
    };
  });
}
```

### Streak Logic

```javascript
function handleShapePlaced(clearedCount) {
  // Update placements counter
  gameState.shapesPlacedThisRound++;

  if (clearedCount > 0) {
    // Cleared! Streak gaat door
    gameState.streak += clearedCount;
    gameState.clearedThisRound = true;

    // Check voor token beloning
    if (gameState.streak >= 20 && gameState.rotateTokens < 3) {
      // Geef token elke 20 streak (20, 40, 60...)
      const tokenThreshold = Math.floor(gameState.streak / 20);
      const tokensEarned = Math.min(tokenThreshold, 3);

      if (tokensEarned > gameState.rotateTokens) {
        gameState.rotateTokens = tokensEarned;
        // Trigger token earned animation
      }
    }

    // Reset round tracking
    gameState.shapesPlacedThisRound = 0;
    gameState.clearedThisRound = false;
  }

  // Check of ronde compleet is (3 shapes geplaatst)
  if (gameState.shapesPlacedThisRound >= 3) {
    if (!gameState.clearedThisRound) {
      // Geen clear in deze ronde van 3 → streak reset
      gameState.streak = 0;
      // Trigger streak lost animation
    }

    // Reset voor volgende ronde
    gameState.shapesPlacedThisRound = 0;
    gameState.clearedThisRound = false;

    // Genereer nieuwe shapes
    gameState.availableShapes = generateNewShapes();
  }
}
```

---

## UI/UX Specificaties

### Layout

```
┌─────────────────────────────────┐
│  SCORE: 12,450    🔄 🔄 ⚫      │  ← Score + Tokens
├─────────────────────────────────┤
│  STREAK: 24 ⚡ UNSTOPPABLE      │  ← Streak + Status
├─────────────────────────────────┤
│                                 │
│       ┌───────────────┐         │
│       │               │         │
│       │   8x8 GRID    │         │
│       │               │         │
│       │               │         │
│       └───────────────┘         │
│                                 │
├─────────────────────────────────┤
│                                 │
│   [SHAPE1]  [SHAPE2]  [SHAPE3]  │  ← Draggable shapes
│                                 │
└─────────────────────────────────┘
```

### Interacties

**Shape plaatsen:**
1. Drag shape van onderaan
2. Hover over grid → toon ghost preview
3. Groen = kan plaatsen, Rood = kan niet
4. Drop om te plaatsen
5. Als valid → plaats + check clears

**Rotate token gebruiken:**
1. Tap op een shape (als je tokens hebt)
2. Shape roteert 90° clockwise
3. Token -1
4. Sound effect + visual feedback

### Animaties (Prioriteit)

| Animatie | Prioriteit | Beschrijving |
|----------|------------|--------------|
| Block place | HIGH | Blok "popt" in positie |
| Row/col clear | HIGH | Rij flitst → blokken verdwijnen met stagger |
| Streak milestone | MEDIUM | Tekst animatie + screen flash |
| Token earned | MEDIUM | Token icoon bounced + glow |
| Near miss warning | MEDIUM | Rode pulse aan randen |
| Game over | LOW | Grid shakes → fade out |

### Geluiden (Prioriteit)

| Geluid | Prioriteit | Wanneer |
|--------|------------|---------|
| Block place | HIGH | Bij elke plaatsing |
| Clear | HIGH | Bij clear (pitch hoger bij combo) |
| Streak break | MEDIUM | Als streak reset |
| Token earn | MEDIUM | Bij 20 streak |
| Token use | MEDIUM | Bij rotate |
| Near miss tension | LOW | Hartslag bij 2/3 zetten zonder clear |

---

## Shape Definities

### Alle Shapes

```javascript
const SHAPE_DEFINITIONS = {
  // Grote shapes
  L_SHAPE: {
    blocks: [{r:0,c:0}, {r:1,c:0}, {r:2,c:0}, {r:2,c:1}],
    rotations: 4
  },
  L_SHAPE_REVERSE: {
    blocks: [{r:0,c:1}, {r:1,c:1}, {r:2,c:1}, {r:2,c:0}],
    rotations: 4
  },
  T_SHAPE: {
    blocks: [{r:0,c:0}, {r:0,c:1}, {r:0,c:2}, {r:1,c:1}],
    rotations: 4
  },
  S_SHAPE: {
    blocks: [{r:0,c:1}, {r:0,c:2}, {r:1,c:0}, {r:1,c:1}],
    rotations: 2
  },
  Z_SHAPE: {
    blocks: [{r:0,c:0}, {r:0,c:1}, {r:1,c:1}, {r:1,c:2}],
    rotations: 2
  },

  // Medium shapes
  LINE_3: {
    blocks: [{r:0,c:0}, {r:1,c:0}, {r:2,c:0}],
    rotations: 2
  },
  LINE_4: {
    blocks: [{r:0,c:0}, {r:1,c:0}, {r:2,c:0}, {r:3,c:0}],
    rotations: 2
  },
  LINE_5: {
    blocks: [{r:0,c:0}, {r:1,c:0}, {r:2,c:0}, {r:3,c:0}, {r:4,c:0}],
    rotations: 2
  },
  SQUARE_2X2: {
    blocks: [{r:0,c:0}, {r:0,c:1}, {r:1,c:0}, {r:1,c:1}],
    rotations: 1
  },
  SQUARE_3X3: {
    blocks: [{r:0,c:0}, {r:0,c:1}, {r:0,c:2}, {r:1,c:0}, {r:1,c:1}, {r:1,c:2}, {r:2,c:0}, {r:2,c:1}, {r:2,c:2}],
    rotations: 1
  },
  SMALL_L: {
    blocks: [{r:0,c:0}, {r:1,c:0}, {r:1,c:1}],
    rotations: 4
  },

  // Kleine shapes
  SINGLE: {
    blocks: [{r:0,c:0}],
    rotations: 1
  },
  LINE_2: {
    blocks: [{r:0,c:0}, {r:1,c:0}],
    rotations: 2
  },
  CORNER: {
    blocks: [{r:0,c:0}, {r:0,c:1}, {r:1,c:0}],
    rotations: 4
  },
};
```

---

## Balancing Parameters

```javascript
const BALANCE_CONFIG = {
  // Grid
  GRID_SIZE: 8,

  // Shapes per ronde
  SHAPES_PER_ROUND: 3,

  // Streak thresholds
  STREAK_TOKEN_THRESHOLD: 20,
  MAX_TOKENS: 3,

  // Streak multipliers
  STREAK_MULTIPLIERS: {
    0: 1,
    10: 2,
    20: 3,
    30: 4,
    40: 5,
    50: 6,
  },

  // Diamond settings
  DIAMOND_CHANCE: 0.12, // ~1 op 8 shapes
  DIAMOND_POINTS: 50,
  NORMAL_POINTS: 10,
  FULL_DIAMOND_ROW_BONUS: 500,

  // Shape weights (hoe vaak ze verschijnen)
  SHAPE_WEIGHTS: {
    SINGLE: 10,
    LINE_2: 15,
    LINE_3: 15,
    CORNER: 12,
    SMALL_L: 12,
    SQUARE_2X2: 10,
    L_SHAPE: 8,
    T_SHAPE: 6,
    S_SHAPE: 5,
    Z_SHAPE: 5,
    LINE_4: 4,
    LINE_5: 2,
    SQUARE_3X3: 2,
  },
};
```

---

## Development Roadmap

### Fase 1: Core (MVP)
- [ ] Grid rendering (8x8)
- [ ] Shape rendering
- [ ] Drag & drop shapes naar grid
- [ ] Basis placement logic
- [ ] Row/column clear detection
- [ ] Score systeem
- [ ] Game over detection
- [ ] Nieuwe shapes genereren

### Fase 2: Streak Systeem
- [ ] Streak counter
- [ ] Streak multiplier
- [ ] Round tracking (3 shapes)
- [ ] Streak reset logic
- [ ] Streak UI display

### Fase 3: Tokens
- [ ] Token earning (streak 20+)
- [ ] Token storage (max 3)
- [ ] Token UI
- [ ] Rotation logic
- [ ] Rotation interaction (tap shape)

### Fase 4: Diamonds
- [ ] Diamond blocks in shapes
- [ ] Diamond visual styling
- [ ] Diamond scoring
- [ ] Full diamond row detection
- [ ] Diamond + streak combo scoring

### Fase 5: Polish
- [ ] Placement animation
- [ ] Clear animation
- [ ] Streak milestone animations
- [ ] Sound effects
- [ ] Near miss warning
- [ ] Haptic feedback
- [ ] High score persistence

### Fase 6: Extra
- [ ] Tutorial/onboarding
- [ ] Settings scherm
- [ ] Daily challenge mode
- [ ] Leaderboard (async)

---

## Bestanden Structuur (Suggestie)

```
/app
  /(tabs)
    index.tsx          # Main game screen
  /components
    Grid.tsx           # 8x8 grid component
    Cell.tsx           # Single cell
    Shape.tsx          # Draggable shape
    ShapePreview.tsx   # Ghost preview op grid
    TokenDisplay.tsx   # Rotate tokens UI
    StreakDisplay.tsx  # Streak counter + status
    ScoreDisplay.tsx   # Score
  /hooks
    useGameState.ts    # Main game logic
    useShapes.ts       # Shape generation
    useDragDrop.ts     # Drag & drop logic
  /utils
    gridHelpers.ts     # Grid manipulation functions
    shapeHelpers.ts    # Shape rotation, placement
    scoreHelpers.ts    # Score calculation
  /constants
    shapes.ts          # Shape definitions
    balance.ts         # Balancing config
    colors.ts          # Color palette
  /assets
    /sounds
    /images
```

---

## Notities voor Claude Code

1. **Start simpel:** Krijg eerst een werkend grid met drag & drop voordat je streak/tokens toevoegt

2. **Test streak logic apart:** Dit is de complexste logica, test uitvoerig

3. **Performance:** React Native kan struggelen met veel state updates. Overweeg `useReducer` of `zustand`

4. **Drag & drop:** Bekijk `react-native-gesture-handler` of `react-native-draggable-flatlist`

5. **Animaties:** `react-native-reanimated` voor smooth 60fps animations

6. **Geluid:** `expo-av` voor audio

7. **Haptics:** `expo-haptics` voor trillingen

8. **Storage:** `expo-secure-store` of `AsyncStorage` voor high scores

---

## Open Vragen / Beslissingen

- [ ] Exacte kleuren palette bepalen
- [ ] Hoeveel verschillende shape types?
- [ ] Exacte sound design
- [ ] Monetization strategie (later)
- [ ] Naam van de game

---

*Document versie 1.0 - Klaar voor Claude Code implementatie*
