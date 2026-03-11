import { Injectable } from '@angular/core';
import {
  Game, IboState, City, ScaleSlot, LogStep, TurnRecord,
  CityPiece, Resource, ArmyUnit, Mood,
  AdvCat, ADVANCE_CATEGORY_TABLE, CATEGORY_TO_PIECE, GOVERNMENTS,
  CARDS_PER_TURN, ActionCardIcon, CARD_ICON_TO_ACTION, CARD_ICON_LABEL, CARD_ICON_EMOJI,
} from '../models/game.models';
import { DiceService } from './dice.service';

// ─── Public result type ───────────────────────────────────────────────────────

export interface TurnResult {
  record: TurnRecord;
  updatedState: IboState;
  /** Prompts the executor needs answers for before applying state changes */
  pendingPrompts: PendingPrompt[];
}

export interface PendingPrompt {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'select';
  options?: string[];
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function cloneState(s: IboState): IboState {
  return structuredClone(s);
}

function cityMaxUnits(city: City): number {
  const base = city.size;
  if (city.mood === Mood.Happy) return base + 1;
  if (city.mood === Mood.Angry) return 1;
  return base;
}

function cityById(state: IboState, id: string): City | undefined {
  return state.cities.find(c => c.id === id);
}

function orderedCities(state: IboState, reverse = false): City[] {
  const ordered = state.cityTrack
    .map(id => cityById(state, id))
    .filter((c): c is City => !!c);
  return reverse ? [...ordered].reverse() : ordered;
}

function smallestNonAngryCityInTrackOrder(state: IboState): City | undefined {
  const eligible = orderedCities(state).filter(c => c.mood !== Mood.Angry);
  if (!eligible.length) return undefined;
  const minSize = Math.min(...eligible.map(c => c.size));
  return eligible.find(c => c.size === minSize);
}

function hasMarketInAnyCity(state: IboState): boolean {
  return state.cities.some(c => c.cityPieces.includes(CityPiece.Market));
}

function shiftScaleLeft(scale: ScaleSlot[]): ScaleSlot[] {
  // Compact: shift all remaining pieces toward position 0, maintaining gaps
  const pieces = scale.filter(s => s.cityPiece !== null).map(s => ({ ...s }));
  const empty = scale.filter(s => s.cityPiece === null).map(s => ({ ...s }));

  // Re-assign positions sequentially (lowest positions first)
  const newScale: ScaleSlot[] = Array.from({ length: 8 }, (_, i) => ({
    position: i,
    cityPiece: null,
    resourceToken: null,
    exhausted: false,
  }));

  pieces.forEach((piece, idx) => {
    newScale[idx] = { ...piece, position: idx };
  });

  return newScale;
}

function addCityPieceToScale(scale: ScaleSlot[], piece: CityPiece, resource?: Resource): ScaleSlot[] {
  const clone = scale.map(s => ({ ...s }));
  // Find the lowest available empty slot
  const emptySlot = clone.filter(s => s.cityPiece === null).sort((a, b) => a.position - b.position)[0];
  if (!emptySlot) return clone; // Scale is full, no-op
  const idx = clone.findIndex(s => s.position === emptySlot.position);
  clone[idx] = {
    position: emptySlot.position,
    cityPiece: piece,
    resourceToken: piece === CityPiece.Settlement ? (resource ?? Resource.Ideas) : null,
    exhausted: false,
  };
  return clone;
}

// ─── Main Service ─────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class IboAiService {
  constructor(private dice: DiceService) {}

  // ── Public entry point ────────────────────────────────────────────────────

  /**
   * Execute IBO's full turn given a pre-resolved list of card icons.
   * The TurnExecutor handles all card-draw logic (deck, roll, or manual)
   * and passes the resolved icons here.
   *
   * @param resolvedCards  One icon per card draw for this turn.
   * @param userInputs     Answers to any pending prompts from a prior call.
   */
  executeTurn(
    game: Game,
    resolvedCards: ActionCardIcon[],
    userInputs: Record<string, string | number | boolean> = {},
  ): TurnResult {
    const state = cloneState(game.iboState);
    const steps: LogStep[] = [];
    const pendingPrompts: PendingPrompt[] = [];
    const cardsThisTurn = CARDS_PER_TURN[game.difficulty][game.currentAge - 1];

    steps.push({ text: `═══ IBO Turn — Age ${game.currentAge}, Cards: ${cardsThisTurn} ═══` });

    for (let i = 0; i < cardsThisTurn; i++) {
      const icon = resolvedCards[i];
      steps.push({ text: `── Card ${i + 1} of ${cardsThisTurn} ──` });

      const action = CARD_ICON_TO_ACTION[icon];
      const label = CARD_ICON_LABEL[icon];
      const emoji = CARD_ICON_EMOJI[icon];
      steps.push({
        text: `Card revealed: ${emoji} ${label}  →  Action: ${action}`,
        cardIcon: icon,
      });

      // CIV SPECIFIC: if no civ board, treat as a d6 roll
      const effectiveAction = (action === 'CIV SPECIFIC' && !game.civId)
        ? this.rollFallbackAction()
        : action;

      if (effectiveAction !== action) {
        steps.push({ text: `No Civ board — rolling fallback: ${effectiveAction}` });
      }

      const actionSteps = this.performAction(effectiveAction, state, userInputs, pendingPrompts, game.civId);
      steps.push(...actionSteps);
    }

    return {
      record: {
        turn: game.currentTurn + 1,
        age: game.currentAge,
        steps,
        timestamp: new Date().toISOString(),
      },
      updatedState: state,
      pendingPrompts,
    };
  }

  /** Fallback when a Civ Specific card is drawn but no civ board is active. */
  private rollFallbackAction(): string {
    const roll = this.dice.d6();
    if (roll <= 2) return 'ADVANCE';
    if (roll === 3) return 'RECRUIT';
    if (roll === 4) return 'ATTACK';
    if (roll === 5) return 'CONSTRUCT';
    return 'INFLUENCE CULTURE';
  }

  // ── Action dispatch ───────────────────────────────────────────────────────

  private performAction(
    action: string,
    state: IboState,
    inputs: Record<string, string | number | boolean>,
    pendingPrompts: PendingPrompt[],
    civId: string | null,
  ): LogStep[] {
    switch (action) {
      case 'ADVANCE': return this.doAdvance(state, inputs, pendingPrompts);
      case 'CONSTRUCT': return this.doConstruct(state, inputs, pendingPrompts, civId);
      case 'RECRUIT': return this.doRecruit(state);
      case 'ATTACK': return this.doAttack(state, inputs, pendingPrompts);
      case 'INFLUENCE CULTURE': return this.doInfluenceCulture(state, inputs, pendingPrompts);
      case 'FOUND CITY': return this.doFoundCity(state, inputs, pendingPrompts);
      default: return [{ text: `Unknown action: ${action}` }];
    }
  }

  // ─── ADVANCE ─────────────────────────────────────────────────────────────

  private doAdvance(
    state: IboState,
    inputs: Record<string, string | number | boolean>,
    prompts: PendingPrompt[],
  ): LogStep[] {
    const steps: LogStep[] = [{ text: 'Action: ADVANCE' }];
    const [high, mid, low] = this.dice.rollAdvance();
    steps.push({ text: `Rolled 3 dice: [${high}, ${mid}, ${low}] (sorted high→low)`, dice: [high, mid, low] });

    const row = this.dice.toD3(high);
    const col = this.dice.toD3(mid);
    steps.push({ text: `d3 values: row=${row}, col=${col}` });

    const category = ADVANCE_CATEGORY_TABLE[row - 1][col - 1];
    const advLevel = state.advancements[category.toLowerCase() as keyof typeof state.advancements] as number;

    if (advLevel >= 4) {
      steps.push({ text: `${category} is full → determining Government advancement` });
      return [...steps, ...this.advanceGovernment(state, low)];
    }

    const available = 4 - advLevel;
    let chosenLevel = advLevel + 1;
    if (available > 1) {
      const d = available === 2 ? this.dice.toD2(low) : this.dice.toD3(low);
      chosenLevel = advLevel + d;
      chosenLevel = Math.min(chosenLevel, 4);
      steps.push({ text: `Multiple advancements available — third die ${low} → pick advancement level ${chosenLevel}`, dice: [low] });
    } else {
      steps.push({ text: `Only one advancement available in ${category} — taking level ${chosenLevel}` });
    }

    // Apply advancement
    const key = category.toLowerCase() as keyof typeof state.advancements;
    (state.advancements as any)[key] = chosenLevel;
    steps.push({ text: `IBO advances in ${category} → level ${chosenLevel}` });

    // Add city piece to scale
    const piece = CATEGORY_TO_PIECE[category];
    state.scale = addCityPieceToScale(state.scale, piece);
    steps.push({ text: `${piece} added to Scale` });

    // Culture token for certain advancements
    if (category === AdvCat.Spirituality && chosenLevel === 3) {
      state.cultureTokens += 1;
      steps.push({ text: 'Spirituality 3rd advancement: IBO earned a Culture token (+1C)' });
    }

    // Advancement effects
    steps.push(...this.applyAdvancementEffects(state, category, chosenLevel, inputs, prompts));

    // Wonder check for Agriculture, Construction, or Government
    if (category === AdvCat.Agriculture || category === AdvCat.Construction) {
      steps.push(...this.wonderCheck(state, inputs, prompts));
    }

    return steps;
  }

  private advanceGovernment(state: IboState, thirdDie: number): LogStep[] {
    const steps: LogStep[] = [];

    if (state.advancements.governmentLevel >= 4 && state.advancements.government !== null) {
      steps.push({ text: 'All Government advancements full → RECRUIT instead' });
      return [...steps, ...this.doRecruit(state)];
    }

    if (!state.advancements.government) {
      // Choose government type
      const govIndex = this.dice.toD3(thirdDie) - 1;
      const gov = GOVERNMENTS[govIndex % GOVERNMENTS.length];
      state.advancements.government = gov;
      state.advancements.governmentLevel = 1;
      steps.push({ text: `Third die ${thirdDie} → IBO adopts ${gov} (level 1)`, dice: [thirdDie] });
    } else {
      state.advancements.governmentLevel = Math.min(4, state.advancements.governmentLevel + 1);
      steps.push({ text: `IBO advances ${state.advancements.government} to level ${state.advancements.governmentLevel}` });
    }

    // Add city piece (Settlement) to scale for Government
    state.scale = addCityPieceToScale(state.scale, CityPiece.Settlement);
    steps.push({ text: 'Settlement added to Scale' });

    // Wonder check
    steps.push(...this.wonderCheck(state, {}, []));

    return steps;
  }

  private applyAdvancementEffects(
    state: IboState,
    category: AdvCat,
    level: number,
    inputs: Record<string, string | number | boolean>,
    prompts: PendingPrompt[],
  ): LogStep[] {
    const steps: LogStep[] = [];

    switch (category) {
      case AdvCat.Agriculture:
        if (level === 3) steps.push({ text: 'Agriculture 3: Reveal a Wonder card!' });
        break;
      case AdvCat.Construction:
        if (level === 3) steps.push({ text: 'Construction 3: Reveal a Wonder card!' });
        break;
      case AdvCat.Maritime:
        steps.push({ text: `Naval Aggression Range is now ${1 + state.advancements.maritime}` });
        break;
      case AdvCat.Education:
        if (level === 3 || level === 4) {
          if (state.actionCardCount > 0) {
            state.actionCardCount -= 1;
            steps.push({ text: `Education ${level}: Discard an Action Card → take additional ADVANCE action` });
            steps.push(...this.doAdvance(state, inputs, prompts));
          }
        }
        break;
      case AdvCat.Warfare:
        steps.push({ text: `Land Aggression Range is now ${1 + state.advancements.warfare}` });
        break;
      case AdvCat.Spirituality:
        if (level === 3 || level === 4) {
          if (state.actionCardCount > 0) {
            state.actionCardCount -= 1;
            steps.push({ text: `Spirituality ${level}: Discard an Action Card → take additional INFLUENCE CULTURE action` });
            steps.push(...this.doInfluenceCulture(state, inputs, prompts));
          }
        }
        break;
      case AdvCat.Economy:
        if (level === 3 || level === 4) {
          if (state.actionCardCount > 0) {
            state.actionCardCount -= 1;
            steps.push({ text: `Economy ${level}: Discard an Action Card → take additional CONSTRUCT action` });
            steps.push(...this.doConstruct(state, inputs, prompts, null));
          }
        }
        break;
      case AdvCat.Traditions:
        steps.push({ text: `Traditions ${level}: +${Math.floor(level / 2)}C during Status Phase from Traditions` });
        break;
      case AdvCat.Science:
        if (level === 3 || level === 4) {
          if (state.actionCardCount > 0) {
            state.actionCardCount -= 1;
            steps.push({ text: `Science ${level}: Discard an Action Card → take additional RECRUIT action` });
            steps.push(...this.doRecruit(state));
          }
        }
        break;
    }

    return steps;
  }

  private wonderCheck(
    state: IboState,
    inputs: Record<string, string | number | boolean>,
    prompts: PendingPrompt[],
  ): LogStep[] {
    const steps: LogStep[] = [{ text: 'Wonder Check!' }];
    const adv = state.advancements;
    const hasAgr3 = adv.agriculture >= 3 || adv.construction >= 3;
    const hasEnough5C = state.cultureTokens >= 5;
    const nonSettlementPieces = state.scale.filter(
      s => s.cityPiece !== null && s.cityPiece !== CityPiece.Settlement,
    ).length;
    const has4Pieces = nonSettlementPieces >= 4;

    steps.push({
      text: `Conditions: Agr/Con 3+: ${hasAgr3 ? '✓' : '✗'} | 5C: ${hasEnough5C ? '✓' : '✗'} | 4+ non-settlement Scale pieces: ${has4Pieces ? '✓' : '✗'}`,
    });

    if (!hasAgr3 || !hasEnough5C || !has4Pieces) {
      steps.push({ text: 'Wonder Check failed — conditions not met.' });
      return steps;
    }

    // Find eligible city
    const happyCities = orderedCities(state).filter(c => c.mood === Mood.Happy && !c.hasWonder);
    const targetCity = happyCities.sort((a, b) => {
      const unitsA = a.armyUnits.length;
      const unitsB = b.armyUnits.length;
      return unitsB - unitsA;
    })[0];

    if (!targetCity) {
      steps.push({ text: 'No eligible city for Wonder (needs Happy, no existing Wonder).' });
      return steps;
    }

    // Remove 4 non-settlement pieces from Scale (right to left)
    let removed = 0;
    const newScale = [...state.scale].sort((a, b) => b.position - a.position);
    for (const slot of newScale) {
      if (removed >= 4) break;
      if (slot.cityPiece !== null && slot.cityPiece !== CityPiece.Settlement) {
        const idx = state.scale.findIndex(s => s.position === slot.position);
        state.scale[idx] = { position: slot.position, cityPiece: null, resourceToken: null, exhausted: false };
        removed++;
      }
    }

    state.cultureTokens -= 5;
    state.scale = shiftScaleLeft(state.scale);

    const wonderKey = 'wonder_' + Math.random().toString(36).slice(2);
    prompts.push({
      key: wonderKey,
      label: 'Which Wonder does IBO build? (choose from revealed Wonders)',
      type: 'select',
      options: ['Great Wall', 'Great Lighthouse', 'Great Library', 'Colosseum', 'Stonehenge', 'Parthenon', 'Great Gardens', 'Pyramids'],
    });

    const wonderName = (inputs[wonderKey] as string) ?? 'A Wonder';
    targetCity.hasWonder = true;
    state.wonders.push(wonderName);

    steps.push({
      text: `IBO builds ${wonderName} in ${targetCity.resource} (largest army Happy city)! 4 Scale pieces removed, 5C spent.`,
    });

    return steps;
  }

  // ─── CONSTRUCT ───────────────────────────────────────────────────────────

  private doConstruct(
    state: IboState,
    inputs: Record<string, string | number | boolean>,
    prompts: PendingPrompt[],
    civId: string | null,
  ): LogStep[] {
    const steps: LogStep[] = [{ text: 'Action: CONSTRUCT' }];

    const settlerCity = state.settlerCityId ? cityById(state, state.settlerCityId) : undefined;
    if (!settlerCity) {
      steps.push({ text: 'No settler city found — cannot CONSTRUCT.' });
      return steps;
    }

    steps.push({ text: `Settler is in ${settlerCity.resource} city` });

    // Find leftmost city-piece on scale
    const leftmostSlot = state.scale
      .filter(s => s.cityPiece !== null)
      .sort((a, b) => a.position - b.position)[0];

    if (!leftmostSlot) {
      steps.push({ text: 'Scale is empty — nothing to CONSTRUCT.' });
      return steps;
    }

    steps.push({ text: `Leftmost Scale piece: ${leftmostSlot.cityPiece} at position ${leftmostSlot.position}` });

    // If Settlement → Found City
    if (leftmostSlot.cityPiece === CityPiece.Settlement) {
      steps.push({ text: 'Leftmost piece is a Settlement → trigger FOUND CITY' });
      return [...steps, ...this.doFoundCity(state, inputs, prompts)];
    }

    // Try to place the piece in the settler city
    const placeable = this.canPlace(leftmostSlot.cityPiece!, settlerCity, state, inputs, prompts);
    if (placeable.canPlace) {
      this.placeInCity(settlerCity, leftmostSlot.cityPiece!, state);
      steps.push({ text: `Placed ${leftmostSlot.cityPiece} in ${settlerCity.resource} city` });
      steps.push(...placeable.steps);

      // Remove from scale and shift
      const slotIdx = state.scale.findIndex(s => s.position === leftmostSlot.position);
      state.scale[slotIdx] = { position: leftmostSlot.position, cityPiece: null, resourceToken: null, exhausted: false };
      state.scale = shiftScaleLeft(state.scale);
    } else {
      // Try next pieces on scale
      steps.push(...placeable.steps);
      steps.push({ text: `Cannot place ${leftmostSlot.cityPiece} in ${settlerCity.resource} — trying next Scale piece` });
      const success = this.tryNextScalePieces(state, settlerCity, steps, inputs, prompts);
      if (!success) {
        steps.push({ text: 'Nothing can be built in this city → move settler, INFLUENCE CULTURE instead' });
        const nextCity = smallestNonAngryCityInTrackOrder(state);
        if (nextCity && nextCity.id !== settlerCity.id) {
          state.settlerCityId = nextCity.id;
          steps.push({ text: `Settler moves to ${nextCity.resource} (smallest non-Angry)` });
        }
        return [...steps, ...this.doInfluenceCulture(state, inputs, prompts)];
      }
    }

    // Move settler to smallest non-Angry city
    const nextCity = smallestNonAngryCityInTrackOrder(state);
    if (nextCity) {
      state.settlerCityId = nextCity.id;
      steps.push({ text: `Settler moves to ${nextCity.resource} (smallest non-Angry city in City-Track order)` });
    }

    return steps;
  }

  private canPlace(
    piece: CityPiece,
    city: City,
    state: IboState,
    inputs: Record<string, string | number | boolean>,
    prompts: PendingPrompt[],
  ): { canPlace: boolean; steps: LogStep[] } {
    const steps: LogStep[] = [];

    // No duplicates (except Settlement which is tracked separately)
    if (city.cityPieces.includes(piece)) {
      steps.push({ text: `${city.resource} already has a ${piece}` });
      return { canPlace: false, steps };
    }

    // Port needs a water hex — ask user
    if (piece === CityPiece.Port) {
      const key = `port_water_${city.id}`;
      if (inputs[key] === undefined) {
        prompts.push({
          key,
          label: `Does ${city.resource} city have access to a water hex for a Port?`,
          type: 'boolean',
        });
        // Optimistically assume yes; executor will re-run if no
        return { canPlace: true, steps: [{ text: `Checking: does ${city.resource} have a water hex? (awaiting input)`, isPrompt: true, promptKey: key }] };
      }
      if (!inputs[key]) {
        steps.push({ text: `No water hex available for ${city.resource} — cannot place Port` });
        return { canPlace: false, steps };
      }
    }

    // Academy: when built → take an ADVANCE action (side effect, handled in placeInCity)
    return { canPlace: true, steps };
  }

  private placeInCity(city: City, piece: CityPiece, state: IboState): void {
    city.cityPieces.push(piece);
    city.size += 1;

    // Immediate effects
    if (piece === CityPiece.Temple) {
      state.cultureTokens += 1;
    }
    if (piece === CityPiece.Observatory) {
      state.actionCardCount += 1;
    }
  }

  private tryNextScalePieces(
    state: IboState,
    city: City,
    steps: LogStep[],
    inputs: Record<string, string | number | boolean>,
    prompts: PendingPrompt[],
  ): boolean {
    const remaining = state.scale
      .filter(s => s.cityPiece !== null && s.cityPiece !== CityPiece.Settlement)
      .sort((a, b) => a.position - b.position);

    for (const slot of remaining) {
      const placeable = this.canPlace(slot.cityPiece!, city, state, inputs, prompts);
      if (placeable.canPlace) {
        this.placeInCity(city, slot.cityPiece!, state);
        steps.push({ text: `Placed ${slot.cityPiece} in ${city.resource} city` });
        steps.push(...placeable.steps);
        const slotIdx = state.scale.findIndex(s => s.position === slot.position);
        state.scale[slotIdx] = { position: slot.position, cityPiece: null, resourceToken: null, exhausted: false };
        state.scale = shiftScaleLeft(state.scale);
        return true;
      }
    }
    return false;
  }

  // ─── FOUND CITY ──────────────────────────────────────────────────────────

  private doFoundCity(
    state: IboState,
    inputs: Record<string, string | number | boolean>,
    prompts: PendingPrompt[],
  ): LogStep[] {
    const steps: LogStep[] = [{ text: 'Action: FOUND CITY' }];

    if (state.cities.length >= 5) {
      steps.push({ text: 'IBO has 5+ cities — cannot Found City.' });
      return steps;
    }

    // Prompt user for whether adjacent unexplored sectors exist
    const adjacentKey = 'found_adjacent';
    if (inputs[adjacentKey] === undefined) {
      prompts.push({
        key: adjacentKey,
        label: 'Are there unexplored sectors adjacent to IBO\'s cities (traced over land or sea with ship)?',
        type: 'boolean',
      });
      steps.push({ text: 'Checking for adjacent unexplored sectors...', isPrompt: true, promptKey: adjacentKey });
      return steps;
    }

    const hasAdjacent = inputs[adjacentKey] as boolean;
    if (hasAdjacent) {
      const adjacentCountKey = 'found_adjacent_count';
      if (inputs[adjacentCountKey] === undefined) {
        prompts.push({ key: adjacentCountKey, label: 'How many eligible adjacent unexplored sectors are there?', type: 'number' });
        steps.push({ text: 'How many adjacent unexplored sectors?', isPrompt: true, promptKey: adjacentCountKey });
        return steps;
      }

      const count = inputs[adjacentCountKey] as number;
      const chosenSector = count > 1 ? this.dice.pickOne(count) : 1;
      if (count > 1) {
        steps.push({ text: `${count} adjacent unexplored sectors — rolling to pick: sector ${chosenSector}`, dice: [chosenSector] });
      } else {
        steps.push({ text: 'One adjacent unexplored sector — revealing it.' });
      }
      steps.push({ text: `Reveal and explore sector ${chosenSector}. Follow standard placement rules.` });
    } else {
      steps.push({ text: 'No adjacent unexplored sectors — targeting closest empty sector.' });
      const targetKey = 'found_terrain_count';
      if (inputs[targetKey] === undefined) {
        prompts.push({ key: targetKey, label: 'How many valid founding spaces exist in the target sector (void of figures)?', type: 'number' });
        steps.push({ text: 'Counting valid founding spaces...', isPrompt: true, promptKey: targetKey });
        return steps;
      }
      const count = inputs[targetKey] as number;
      if (count > 1) {
        const chosen = this.dice.pickOne(count);
        steps.push({ text: `${count} valid spaces — rolling to pick: space ${chosen}`, dice: [chosen] });
        steps.push({ text: 'Place Settlement on preferred terrain following City-Track Terrain Order (Plains > Grassland > Hill > Desert > Forest > Mountain)' });
      }
    }

    // Find the leftmost Settlement on scale with its resource token
    const settlementSlot = state.scale
      .filter(s => s.cityPiece === CityPiece.Settlement)
      .sort((a, b) => a.position - b.position)[0];

    if (!settlementSlot) {
      steps.push({ text: 'No Settlement on Scale to found with!' });
      return steps;
    }

    const resource = settlementSlot.resourceToken ?? Resource.Ideas;
    const newCity: City = {
      id: resource + '_' + Date.now(),
      resource,
      cityTrackIndex: state.cities.length,
      cityPieces: [],
      hasSettlement: true,
      armyUnits: [ArmyUnit.Infantry],
      ships: 0,
      mood: Mood.Neutral,
      size: 1,
      underInfluence: false,
      hasWonder: false,
    };

    // Remove settlement from scale
    const slotIdx = state.scale.findIndex(s => s.position === settlementSlot.position);
    state.scale[slotIdx] = { position: settlementSlot.position, cityPiece: null, resourceToken: null, exhausted: false };
    state.scale = shiftScaleLeft(state.scale);

    // Add to city track (at end)
    state.cities.push(newCity);
    state.cityTrack.push(newCity.id);

    // Move settler
    const nextCity = smallestNonAngryCityInTrackOrder(state);
    if (nextCity) {
      state.settlerCityId = nextCity.id;
      steps.push({ text: `Settler moves to ${nextCity.resource} (smallest non-Angry in City-Track order)` });
    }

    steps.push({ text: `New city founded! ${resource} city added to City-Track with 1 Infantry. Place on map.` });

    return steps;
  }

  // ─── RECRUIT ─────────────────────────────────────────────────────────────

  private doRecruit(state: IboState): LogStep[] {
    const steps: LogStep[] = [{ text: 'Action: RECRUIT' }];
    const hasMarket = hasMarketInAnyCity(state);
    steps.push({ text: `Recruiting in reverse City-Track order. Market: ${hasMarket ? 'Yes' : 'No'}` });

    const cities = orderedCities(state, true); // reverse
    let leaderCityId: string | null = null;

    for (const city of cities) {
      const max = cityMaxUnits(city);
      const current = city.armyUnits.length;
      steps.push({ text: `${city.resource} (Size ${city.size}, ${city.mood > 0 ? 'Happy' : city.mood < 0 ? 'Angry' : 'Neutral'}, ${current}/${max} units)` });

      if (current >= max) {
        steps.push({ text: `  → Already at max units (${max})` });
        continue;
      }

      if (current === 0) {
        city.armyUnits.push(ArmyUnit.Infantry);
        steps.push({ text: `  → First unit: Infantry placed` });
        continue;
      }

      // Roll to determine unit type
      const roll = this.dice.d6();
      steps.push({ text: `  → Roll: ${roll}`, dice: [roll] });

      let unit: ArmyUnit;
      if (!hasMarket) {
        unit = ArmyUnit.Infantry;
        steps.push({ text: `  → No Market → Infantry` });
      } else if (roll <= 2) {
        unit = ArmyUnit.Infantry;
        steps.push({ text: `  → Infantry` });
      } else if (roll <= 4) {
        unit = ArmyUnit.Cavalry;
        steps.push({ text: `  → Cavalry` });
      } else {
        unit = ArmyUnit.Elephant;
        steps.push({ text: `  → Elephant` });
      }

      // Check if it would be a Leader roll
      // In the rules: if you roll Leader (represented here as 6 in special cases),
      // move Leader to city, spawn Infantry at old location.
      // For simplicity we treat 6 as the Leader trigger in market cities.
      if (hasMarket && roll === 6 && state.leaderOnBoard) {
        steps.push({ text: `  → Leader roll! Move Leader to ${city.resource}, spawn Infantry at old location` });
        leaderCityId = city.id;
        unit = ArmyUnit.Infantry; // Infantry spawns where leader was
      }

      city.armyUnits.push(unit);
    }

    // Ships: for each Port city (in reverse track order), recruit 1 ship
    const portCities = orderedCities(state, true).filter(c => c.cityPieces.includes(CityPiece.Port));
    for (const city of portCities) {
      city.ships += 1;
      steps.push({ text: `  Ship recruited at ${city.resource} Port (check Barricade Rule if enemy ships on Port)` });
    }

    return steps;
  }

  // ─── ATTACK ──────────────────────────────────────────────────────────────

  private doAttack(
    state: IboState,
    inputs: Record<string, string | number | boolean>,
    prompts: PendingPrompt[],
  ): LogStep[] {
    const steps: LogStep[] = [{ text: 'Action: ATTACK' }];
    const landRange = 1 + state.advancements.warfare;
    const navalRange = 1 + state.advancements.maritime;

    steps.push({ text: `Land Aggression Range: ${landRange} | Naval Aggression Range: ${navalRange}` });

    // Step 1: Remove lone settlers
    steps.push({ text: 'Step 1: Remove all lone player settlers within Land Aggression Range of Happy IBO cities.' });

    // Step 2: Determine attack target — requires user input
    const targetKey = 'attack_target';
    if (inputs[targetKey] === undefined) {
      prompts.push({
        key: targetKey,
        label: `Which enemy city/army is within range ${landRange} of a Happy IBO city that IBO has Unit Advantage ≥ 0 against? (Enter description or "none")`,
        type: 'select',
        options: ['none', 'target_identified'],
      });
      steps.push({
        text: `Looking for attack target within Land Aggression Range ${landRange}...`,
        isPrompt: true,
        promptKey: targetKey,
        promptLabel: 'Identify the closest target IBO would attack (highest Unit Advantage ≥ 0)',
      });
      return steps;
    }

    if (inputs[targetKey] === 'none') {
      steps.push({ text: 'No valid attack target found → CONSTRUCT instead' });
      return [...steps, ...this.doConstruct(state, inputs, prompts, null)];
    }

    // Unit advantage inputs
    const iboUnitsKey = 'attack_ibo_units';
    const targetUnitsKey = 'attack_target_units';
    const hasFortressKey = 'attack_target_fortress';
    const hasLeaderKey = 'attack_has_leader';

    if (inputs[iboUnitsKey] === undefined) {
      prompts.push(
        { key: iboUnitsKey, label: 'How many army units in IBO\'s attacking army?', type: 'number' },
        { key: targetUnitsKey, label: 'How many units in the target city/army?', type: 'number' },
        { key: hasFortressKey, label: 'Does the target have a player Fortress (+1 unit advantage)?', type: 'boolean' },
        { key: hasLeaderKey, label: 'Is a Leader present in the battle (IBO or player)?', type: 'boolean' },
      );
      steps.push({ text: 'Calculating Unit Advantage — need battle details...', isPrompt: true, promptKey: iboUnitsKey });
      return steps;
    }

    const iboUnits = inputs[iboUnitsKey] as number;
    const targetUnits = inputs[targetUnitsKey] as number;
    const hasFortress = inputs[hasFortressKey] as boolean;
    const hasLeader = inputs[hasLeaderKey] as boolean;

    const effectiveTarget = targetUnits + (hasFortress ? 1 : 0);
    const unitAdvantage = iboUnits - effectiveTarget;

    steps.push({ text: `Unit Advantage: ${iboUnits} − ${effectiveTarget} = ${unitAdvantage}` });

    if (unitAdvantage < 0) {
      steps.push({ text: 'Unit Advantage < 0 — IBO will not attack this target. No valid target → CONSTRUCT instead' });
      return [...steps, ...this.doConstruct(state, inputs, prompts, null)];
    }

    const useActionCard = unitAdvantage <= 0 || hasLeader;
    steps.push({ text: `IBO ${useActionCard ? 'WILL' : 'will NOT'} use an Action Card this round (advantage ≤ 0 or leader present: ${useActionCard})` });
    if (useActionCard && state.actionCardCount > 0) {
      state.actionCardCount -= 1;
      steps.push({ text: 'Action Card drawn and revealed. Apply card effect if applicable.' });
    }

    steps.push({ text: 'Resolve combat according to standard rules. After each round:' });
    steps.push({ text: '  • Recalculate Unit Advantage' });
    steps.push({ text: '  • IBO retreats if Unit Advantage ≤ -1 (units return to original city)' });
    steps.push({ text: '  • On win vs size-1: Raze city. On win vs size-2+: IBO captures — move units in, replace settlement from Scale.' });

    // Naval attack hint
    steps.push({ text: `After land battle: check Naval attack. IBO ships can move up to ${navalRange} spaces. Attack if Unit Advantage ≥ 0.` });

    return steps;
  }

  // ─── INFLUENCE CULTURE ────────────────────────────────────────────────────

  private doInfluenceCulture(
    state: IboState,
    inputs: Record<string, string | number | boolean>,
    prompts: PendingPrompt[],
  ): LogStep[] {
    const steps: LogStep[] = [{ text: 'Action: INFLUENCE CULTURE' }];

    steps.push({ text: `IBO has ${state.cultureTokens} Culture tokens available.` });
    steps.push({ text: 'IBO targets the "cheapest" player city-piece — the one requiring the least Culture to reach with range.' });
    steps.push({ text: 'Note: IBO cannot Influence from cities under your influence. Cities with Obelisks cannot be targeted.' });

    const targetKey = 'ic_target';
    if (inputs[targetKey] === undefined) {
      prompts.push({
        key: targetKey,
        label: 'What is the cheapest/closest player city-piece IBO can target? (Enter "none" if no valid target)',
        type: 'select',
        options: ['none', 'target_found'],
      });
      steps.push({ text: 'Identify the cheapest target...', isPrompt: true, promptKey: targetKey });
      return steps;
    }

    if (inputs[targetKey] === 'none') {
      steps.push({ text: 'No valid Influence Culture target — action skipped.' });
      return steps;
    }

    const costKey = 'ic_cost';
    if (inputs[costKey] === undefined) {
      prompts.push({ key: costKey, label: 'How many Culture does IBO need to spend to reach the target\'s range?', type: 'number' });
      steps.push({ text: 'How much culture to reach range?', isPrompt: true, promptKey: costKey });
      return steps;
    }

    const rangeCost = inputs[costKey] as number;
    if (state.cultureTokens < rangeCost) {
      steps.push({ text: `Not enough Culture (have ${state.cultureTokens}, need ${rangeCost}) — cannot Influence Culture.` });
      return steps;
    }

    state.cultureTokens -= rangeCost;
    steps.push({ text: `IBO spends ${rangeCost}C to reach range. Remaining: ${state.cultureTokens}C` });

    // Roll for influence
    const roll = this.dice.d6();
    steps.push({ text: `Influence Culture roll: ${roll}`, dice: [roll] });
    steps.push({ text: `IBO may spend Culture to boost the roll. Each Culture spent = +1 to roll. Minimum 7 needed for success (or check Govern/Monument restrictions).` });

    const boostKey = 'ic_boost';
    if (inputs[boostKey] === undefined) {
      prompts.push({ key: boostKey, label: `Roll was ${roll}. How much Culture should IBO spend to boost? (IBO will spend minimum needed for success, or 0 if can't succeed)`, type: 'number' });
      steps.push({ text: `Roll: ${roll}. How much Culture to boost?`, isPrompt: true, promptKey: boostKey });
      return steps;
    }

    const boost = inputs[boostKey] as number;
    if (boost > 0 && state.cultureTokens >= boost) {
      state.cultureTokens -= boost;
      steps.push({ text: `IBO spends ${boost}C to boost. Final roll: ${roll + boost}. Remaining: ${state.cultureTokens}C` });
      steps.push({ text: 'Turn the influenced city-piece to IBO\'s color!' });
    } else if (boost > 0) {
      steps.push({ text: `Not enough Culture to boost — Influence Culture failed.` });
    } else {
      steps.push({ text: `Roll: ${roll + boost}. Determine success based on standard rules.` });
    }

    return steps;
  }

  // ─── STATUS PHASE ────────────────────────────────────────────────────────

  executeStatusPhase(game: Game): { steps: LogStep[]; updatedState: IboState } {
    const state = cloneState(game.iboState);
    const steps: LogStep[] = [{ text: '═══ STATUS PHASE ═══' }];

    // 1. Completed Objectives
    steps.push({ text: '1. Check Civilization Board for completed objective actions.' });

    // 2. Free ADVANCE
    steps.push({ text: '2. Free ADVANCE action:' });
    const advSteps = this.doAdvance(state, {}, []);
    steps.push(...advSteps);

    // 3. Draw Action Card
    state.actionCardCount += 1;
    steps.push({ text: `3. IBO gains 1 Action Card (now has ${state.actionCardCount})` });

    // 4. Raze Size-1 City / Increase Mood
    steps.push({ text: '4. Raze Phase: All IBO cities increase Mood by 1 step.' });
    for (const city of state.cities) {
      if (city.mood < Mood.Happy) {
        city.mood = Math.min(Mood.Happy, (city.mood + 1) as Mood);
        steps.push({ text: `  ${city.resource}: mood → ${city.mood > 0 ? 'Happy' : 'Neutral'}` });
      }
    }

    // 5. Change Government / Traditions bonus
    const traditionsBonus = Math.floor(state.advancements.traditions / 2);
    if (traditionsBonus > 0) {
      state.cultureTokens += traditionsBonus;
      steps.push({ text: `5. Traditions: IBO gains ${traditionsBonus}C (${state.advancements.traditions} Traditions advancements ÷ 2). Total: ${state.cultureTokens}C` });
    } else {
      steps.push({ text: '5. No Traditions bonus this phase.' });
    }

    // 6. Determine First Player
    steps.push({ text: `6. First Player: IBO counts Culture only (${state.cultureTokens}C). You count Culture + Mood.` });
    steps.push({ text: '   If IBO wins: roll d6 → 1–3 you go first, 4–6 IBO goes first.' });

    return { steps, updatedState: state };
  }
}
