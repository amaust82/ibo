import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Game, IboState, LogStep, TurnRecord,
  ActionCardIcon, CARD_ICON_TO_ACTION, CARD_ICON_LABEL, CARD_ICON_EMOJI,
  CardDrawMode, DEFAULT_DECK_COMPOSITION,
} from '../../../../core/models/game.models';
import { IboAiService, TurnResult, PendingPrompt } from '../../../../core/services/ibo-ai.service';
import { buildDeck, shuffleDeck } from '../../../../core/services/game-state.service';

// ─── Card icon metadata for the manual selector ───────────────────────────────

interface CardOption {
  icon: ActionCardIcon;
  emoji: string;
  label: string;
  action: string;
}

const CARD_OPTIONS: CardOption[] = [
  { icon: ActionCardIcon.Advance1,         emoji: '⚙️', label: 'Advance I',        action: 'ADVANCE' },
  { icon: ActionCardIcon.Advance2,         emoji: '⚙️', label: 'Advance II',       action: 'ADVANCE' },
  { icon: ActionCardIcon.Recruit,          emoji: '🐴', label: 'Recruit',          action: 'RECRUIT' },
  { icon: ActionCardIcon.Attack,           emoji: '⚔️', label: 'Attack',           action: 'ATTACK' },
  { icon: ActionCardIcon.Construct,        emoji: '○',  label: 'No Icon (Const.)', action: 'CONSTRUCT' },
  { icon: ActionCardIcon.InfluenceCulture, emoji: '🎭', label: 'Infl. Culture',    action: 'INFLUENCE CULTURE' },
  { icon: ActionCardIcon.CivSpecific,      emoji: '🌟', label: 'Civ Specific',     action: 'CIV SPECIFIC' },
];

// ─── Phase state machine ──────────────────────────────────────────────────────

type Phase =
  | { kind: 'idle' }
  | { kind: 'drawing'; cardIndex: number; totalCards: number }
  | { kind: 'resolving'; cards: ActionCardIcon[] }
  | { kind: 'prompting'; cards: ActionCardIcon[]; prompts: PendingPrompt[]; answeredSoFar: Record<string, string | number | boolean> }
  | { kind: 'done'; result: TurnResult };

@Component({
  selector: 'app-turn-executor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="executor-panel">

      <!-- Header: Age + Resources -->
      <div class="executor-header">
        <div class="age-info">
          <span class="label">Age</span>
          <div class="age-controls">
            <button class="btn btn-sm btn-ghost" (click)="adjustAge(-1)" [disabled]="game().currentAge <= 1">−</button>
            <span class="age-value">{{ game().currentAge }}</span>
            <button class="btn btn-sm btn-ghost" (click)="adjustAge(1)" [disabled]="game().currentAge >= 6">+</button>
          </div>
        </div>
        <div class="chips">
          <span class="chip chip-culture">🎭 {{ game().iboState.cultureTokens }}C</span>
          <span class="chip chip-cards">🃏 {{ game().iboState.actionCardCount }}</span>
          <span class="chip chip-deck" [title]="deckTooltip()">🂠 {{ game().iboState.deckPile.length }}</span>
          @if (game().iboState.captives > 0) {
            <span class="chip chip-captive">⛓ {{ game().iboState.captives }}</span>
          }
        </div>
      </div>

      <!-- Quick resource editors -->
      <div class="resource-editor">
        <div class="re-row">
          <label>Culture</label>
          <div class="counter">
            <button type="button" class="btn btn-sm" (click)="adjustCulture(-1)">−</button>
            <span>{{ game().iboState.cultureTokens }}</span>
            <button type="button" class="btn btn-sm" (click)="adjustCulture(1)">+</button>
          </div>
          <label>Action Cards</label>
          <div class="counter">
            <button type="button" class="btn btn-sm" (click)="adjustCards(-1)">−</button>
            <span>{{ game().iboState.actionCardCount }}</span>
            <button type="button" class="btn btn-sm" (click)="adjustCards(1)">+</button>
          </div>
        </div>
        @if (game().civId === 'aztecs') {
          <div class="re-row">
            <label>Captives</label>
            <div class="counter">
              <button type="button" class="btn btn-sm" (click)="adjustCaptives(-1)">−</button>
              <span>{{ game().iboState.captives }}</span>
              <button type="button" class="btn btn-sm" (click)="adjustCaptives(1)">+</button>
            </div>
          </div>
        }
      </div>

      <!-- Draw Mode indicator -->
      <div class="draw-mode-bar">
        <span class="draw-mode-label">Card Draw:</span>
        <span class="draw-mode-badge" [class]="'mode-' + game().cardDrawMode">
          @if (game().cardDrawMode === 'deck') { 🂠 Deck ({{ game().iboState.deckPile.length }} remaining) }
          @if (game().cardDrawMode === 'roll') { 🎲 Die Roll }
          @if (game().cardDrawMode === 'manual') { ✋ Manual }
        </span>
        @if (game().cardDrawMode === 'deck') {
          <button class="btn btn-sm btn-ghost" (click)="reshuffleDeck()" title="Reshuffle discard into deck">
            ↺ Reshuffle
          </button>
        }
      </div>

      <!-- ── IDLE: action buttons ─────────────────────────────────── -->
      @if (phase().kind === 'idle') {
        <div class="action-buttons">
          <button class="btn btn-primary" (click)="startTurn()">▶ Execute IBO Turn</button>
          <button class="btn btn-secondary" (click)="executeStatusPhase()">📋 Status Phase</button>
        </div>
      }

      <!-- ── DRAWING: card draw step for current card ───────────── -->
      @if (phase().kind === 'drawing') {
        @let drawPhase = asDrawing(phase());
        <div class="draw-phase">
          <div class="draw-header">
            Card {{ drawPhase.cardIndex + 1 }} of {{ drawPhase.totalCards }}
            — {{ modeLabel(game().cardDrawMode) }}
          </div>

          @if (game().cardDrawMode === 'deck') {
            <!-- Auto: show what was drawn from deck -->
            @if (drawnCardForSlot(); as drawn) {
              <div class="drawn-card">
                <div class="card-face">
                  <span class="card-emoji">{{ cardEmoji(drawn) }}</span>
                  <span class="card-label">{{ cardLabel(drawn) }}</span>
                  <span class="card-action">→ {{ cardAction(drawn) }}</span>
                </div>
                <button class="btn btn-primary" (click)="confirmCard(drawn)">Confirm →</button>
              </div>
            }
          }

          @if (game().cardDrawMode === 'roll') {
            <!-- Auto: show die roll result -->
            @if (rolledCard(); as rolled) {
              <div class="drawn-card">
                <div class="roll-result">
                  <div class="die-face">{{ rolledDie() }}</div>
                </div>
                <div class="card-face">
                  <span class="card-emoji">{{ cardEmoji(rolled) }}</span>
                  <span class="card-label">{{ cardLabel(rolled) }}</span>
                  <span class="card-action">→ {{ cardAction(rolled) }}</span>
                </div>
                <button class="btn btn-primary" (click)="confirmCard(rolled)">Confirm →</button>
              </div>
            }
          }

          @if (game().cardDrawMode === 'manual') {
            <!-- Manual: full card picker -->
            <div class="card-picker">
              <p class="picker-hint">Select the icon on the card you drew:</p>
              <div class="card-grid">
                @for (opt of visibleCardOptions(); track opt.icon) {
                  <button
                    type="button"
                    class="card-option"
                    [class.selected]="manualSelection() === opt.icon"
                    (click)="manualSelection.set(opt.icon)">
                    <span class="co-emoji">{{ opt.emoji }}</span>
                    <span class="co-label">{{ opt.label }}</span>
                    <span class="co-action">{{ opt.action }}</span>
                  </button>
                }
              </div>
              <button class="btn btn-primary" [disabled]="!manualSelection()"
                (click)="confirmCard(manualSelection()!)">
                Confirm {{ manualSelection() ? cardLabel(manualSelection()!) : '' }} →
              </button>
            </div>
          }

          <button class="btn btn-ghost btn-sm" (click)="cancelTurn()">Cancel turn</button>
        </div>
      }

      <!-- ── RESOLVING / DONE: step log + finalize ─────────────── -->
      @if (phase().kind === 'resolving' || phase().kind === 'done') {
        @let result = currentResult();
        @if (result) {
          <div class="current-turn">
            <div class="ct-header">Current Turn Preview</div>
            <div class="ct-steps">
              @for (step of result.record.steps; track $index) {
                <div class="ct-step"
                     [class.step-header]="step.text.startsWith('═')"
                     [class.step-section]="step.text.startsWith('──')">
                  @if (step.cardIcon) {
                    <span class="inline-card">
                      {{ cardEmoji(step.cardIcon) }} {{ cardLabel(step.cardIcon) }}
                    </span>
                  }
                  @if (step.dice?.length) {
                    <div class="dice-row">
                      @for (d of step.dice; track $index) {
                        <div class="die">{{ d }}</div>
                      }
                    </div>
                  }
                  <span class="step-text">{{ step.text }}</span>
                </div>
              }
            </div>
          </div>

          @if (phase().kind === 'done') {
            <div class="turn-complete">
              <button class="btn btn-success" (click)="finalizeTurn()">✓ Apply & Save Turn</button>
              <button class="btn btn-ghost btn-sm" (click)="cancelTurn()">Discard</button>
            </div>
          }
        }
      }

      <!-- ── PROMPTING: board state questions ───────────────────── -->
      @if (phase().kind === 'prompting') {
        @let promptPhase = asPrompting(phase());
        <div class="prompts-panel">
          <div class="prompts-header">IBO needs board information to continue:</div>
          @for (prompt of promptPhase.prompts; track prompt.key) {
            <div class="prompt-item">
              <label class="prompt-label">{{ prompt.label }}</label>
              @if (prompt.type === 'boolean') {
                <div class="btn-group">
                  <button type="button" class="btn btn-sm btn-toggle"
                    [class.active]="getAnswer(prompt.key) === true"
                    (click)="setAnswer(prompt.key, true)">Yes</button>
                  <button type="button" class="btn btn-sm btn-toggle"
                    [class.active]="getAnswer(prompt.key) === false"
                    (click)="setAnswer(prompt.key, false)">No</button>
                </div>
              } @else if (prompt.type === 'number') {
                <input type="number" min="0" class="prompt-input"
                  [value]="getAnswer(prompt.key) ?? ''"
                  (input)="setAnswer(prompt.key, +($any($event.target).value))" />
              } @else if (prompt.type === 'select') {
                <div class="btn-group flex-wrap">
                  @for (opt of prompt.options; track opt) {
                    <button type="button" class="btn btn-sm btn-toggle"
                      [class.active]="getAnswer(prompt.key) === opt"
                      (click)="setAnswer(prompt.key, opt)">{{ opt }}</button>
                  }
                </div>
              }
            </div>
          }
          <div class="prompt-actions">
            <button class="btn btn-primary" [disabled]="!allAnswered()"
              (click)="continueWithAnswers()">Continue →</button>
            <button class="btn btn-ghost btn-sm" (click)="cancelTurn()">Cancel</button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .executor-panel {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: .75rem;
      display: flex; flex-direction: column; gap: .65rem;
    }
    /* Header */
    .executor-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .4rem; }
    .age-info { display: flex; align-items: center; gap: .4rem; }
    .age-info .label { font-size: .75rem; color: var(--text-muted); font-weight: 600; }
    .age-controls { display: flex; align-items: center; gap: .25rem; }
    .age-value { font-size: 1.4rem; font-weight: 700; color: var(--accent); min-width: 1.5rem; text-align: center; }
    .chips { display: flex; gap: .3rem; flex-wrap: wrap; }
    .chip { font-size: .75rem; padding: .18rem .45rem; border-radius: 10px; font-weight: 600; cursor: default; }
    .chip-culture { background: #2a1808; color: #d4a030; }
    .chip-cards   { background: #102010; color: #70a838; }
    .chip-deck    { background: #201808; color: #9a8030; }
    .chip-captive { background: #3a1010; color: #e06060; }
    /* Resource editor */
    .resource-editor { background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: .45rem .6rem; }
    .re-row { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
    .re-row label { font-size: .75rem; color: var(--text-muted); min-width: 3.5rem; }
    .counter { display: flex; align-items: center; gap: .35rem; }
    .counter span { min-width: 1.5rem; text-align: center; font-weight: 700; }
    /* Draw mode bar */
    .draw-mode-bar { display: flex; align-items: center; gap: .5rem; font-size: .78rem; }
    .draw-mode-label { color: var(--text-muted); }
    .draw-mode-badge { padding: .18rem .5rem; border-radius: 10px; font-weight: 600; font-size: .75rem; }
    .mode-deck   { background: #102010; color: #78a840; }
    .mode-roll   { background: #281e08; color: #c0a050; }
    .mode-manual { background: #1e1c10; color: #908870; }
    /* Action buttons */
    .action-buttons { display: flex; gap: .5rem; }
    .action-buttons .btn { flex: 1; }
    /* Draw phase */
    .draw-phase {
      border: 1px solid var(--accent); border-radius: 8px; padding: .65rem;
      display: flex; flex-direction: column; gap: .6rem;
      background: rgba(212,168,48,.05);
      box-shadow: 0 0 16px rgba(212,168,48,.08), inset 0 1px 0 rgba(255,255,255,.04);
    }
    .draw-header { font-size: .8rem; font-weight: 700; color: var(--accent); }
    .drawn-card { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
    .card-face {
      display: flex; align-items: center; gap: .4rem;
      background: #241c0e; border: 1.5px solid var(--border2); border-radius: 8px;
      padding: .45rem .75rem; flex: 1; min-width: 160px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
    }
    .card-emoji { font-size: 1.3rem; }
    .card-label { font-weight: 600; font-size: .9rem; }
    .card-action { font-size: .75rem; color: var(--accent); margin-left: auto; }
    .roll-result { display: flex; align-items: center; gap: .35rem; }
    .die-face {
      width: 32px; height: 32px; border: 2px solid var(--accent); border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; font-weight: 700; color: var(--accent);
    }
    /* Manual card picker */
    .card-picker { display: flex; flex-direction: column; gap: .5rem; }
    .picker-hint { font-size: .78rem; color: var(--text-muted); margin: 0; }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: .35rem; }
    .card-option {
      display: flex; flex-direction: column; align-items: center; gap: .2rem;
      background: var(--bg); border: 1.5px solid var(--border); border-radius: 8px;
      padding: .5rem .3rem; cursor: pointer; transition: border-color .15s, background .15s;
      font-family: inherit;
    }
    .card-option:hover { border-color: var(--accent); }
    .card-option.selected { border-color: var(--accent); background: rgba(240,192,64,.1); }
    .co-emoji { font-size: 1.4rem; }
    .co-label { font-size: .72rem; font-weight: 600; text-align: center; }
    .co-action { font-size: .62rem; color: var(--text-muted); text-align: center; }
    /* Step log */
    .current-turn { background: var(--bg); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
    .ct-header { font-size: .72rem; font-weight: 700; padding: .25rem .5rem; background: var(--border); color: var(--text-muted); }
    .ct-steps { max-height: 220px; overflow-y: auto; padding: .3rem .4rem; }
    .ct-step { font-size: .76rem; padding: .1rem .15rem; line-height: 1.45; display: flex; align-items: flex-start; gap: .3rem; flex-wrap: wrap; }
    .step-header { font-weight: 700; color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: .2rem; margin-bottom: .1rem; }
    .step-section { color: var(--text-muted); font-style: italic; }
    .inline-card {
      font-size: .7rem; padding: .1rem .35rem; border-radius: 4px;
      background: rgba(240,192,64,.12); border: 1px solid rgba(240,192,64,.3);
      white-space: nowrap; flex-shrink: 0;
    }
    .dice-row { display: flex; gap: .15rem; }
    .die { width: 18px; height: 18px; border: 1.5px solid var(--accent); border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: .7rem; font-weight: 700; color: var(--accent); flex-shrink: 0; }
    .step-text { flex: 1; }
    /* Turn complete */
    .turn-complete { display: flex; gap: .5rem; justify-content: flex-end; }
    /* Prompts */
    .prompts-panel { background: rgba(255,180,50,.07); border: 1px solid rgba(255,180,50,.3); border-radius: 6px; padding: .6rem; display: flex; flex-direction: column; gap: .5rem; }
    .prompts-header { font-size: .8rem; font-weight: 700; color: #ffb347; }
    .prompt-item { display: flex; flex-direction: column; gap: .25rem; }
    .prompt-label { font-size: .8rem; }
    .prompt-input { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: .28rem .4rem; border-radius: 4px; font-size: .85rem; max-width: 80px; }
    .btn-group { display: flex; gap: .25rem; flex-wrap: wrap; }
    .btn-toggle { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: .22rem .55rem; border-radius: 4px; cursor: pointer; font-size: .78rem; font-family: inherit; }
    .btn-toggle.active { border-color: var(--accent); background: rgba(240,192,64,.12); color: var(--accent); }
    .flex-wrap { flex-wrap: wrap; }
    .prompt-actions { display: flex; gap: .4rem; justify-content: flex-end; }
  `],
})
export class TurnExecutorComponent {
  game = input.required<Game>();
  turnCompleted = output<{ record: TurnRecord; updatedState: IboState }>();
  stateChanged = output<IboState>();
  ageChanged = output<number>();

  // ── Phase state ──────────────────────────────────────────────────────────
  phase = signal<Phase>({ kind: 'idle' });

  // Per-card draw state
  drawnCardForSlot = signal<ActionCardIcon | null>(null);
  rolledCard       = signal<ActionCardIcon | null>(null);
  rolledDie        = signal<number | null>(null);
  manualSelection  = signal<ActionCardIcon | null>(null);

  // Accumulated cards for this turn
  resolvedCards = signal<ActionCardIcon[]>([]);

  // Prompt answers
  answers = signal<Record<string, string | number | boolean>>({});

  // Current AI result (set after all cards resolved)
  currentResult = signal<TurnResult | null>(null);

  // ── Computed ────────────────────────────────────────────────────────────
  allAnswered = computed(() => {
    const p = this.phase();
    if (p.kind !== 'prompting') return false;
    return p.prompts.every(pr => this.answers()[pr.key] !== undefined && this.answers()[pr.key] !== '');
  });

  visibleCardOptions = computed(() => {
    if (!this.game().includeCivSpecificCards) {
      return CARD_OPTIONS.filter(o => o.icon !== ActionCardIcon.CivSpecific);
    }
    return CARD_OPTIONS;
  });

  deckTooltip = computed(() => {
    const s = this.game().iboState;
    return `Deck: ${s.deckPile.length} | Discard: ${s.discardPile.length}`;
  });

  constructor(private ai: IboAiService) {}

  // ── Public helpers ───────────────────────────────────────────────────────
  cardEmoji(icon: ActionCardIcon): string { return CARD_ICON_EMOJI[icon]; }
  cardLabel(icon: ActionCardIcon): string { return CARD_ICON_LABEL[icon]; }
  cardAction(icon: ActionCardIcon): string { return CARD_ICON_TO_ACTION[icon]; }
  modeLabel(mode: CardDrawMode): string {
    return { deck: '🂠 Drawing from deck', roll: '🎲 Rolling die', manual: '✋ Manual entry' }[mode];
  }

  // Angular type-narrowing helpers for template
  asDrawing(p: Phase) { return p as Extract<Phase, { kind: 'drawing' }>; }
  asPrompting(p: Phase) { return p as Extract<Phase, { kind: 'prompting' }>; }

  // ── Turn flow ────────────────────────────────────────────────────────────

  startTurn() {
    const totalCards = this.cardsThisTurn();
    this.resolvedCards.set([]);
    this.currentResult.set(null);
    this.answers.set({});
    this.phase.set({ kind: 'drawing', cardIndex: 0, totalCards });
    this.prepareNextDraw(0);
  }

  /** Set up the auto-draw/roll for the current card index. */
  private prepareNextDraw(index: number) {
    const mode = this.game().cardDrawMode;
    this.manualSelection.set(null);

    if (mode === 'deck') {
      const deck = this.game().iboState.deckPile;
      if (deck.length === 0) {
        // Auto-reshuffle
        this.reshuffleDeck();
      }
      // Peek at top card — will be removed on confirm
      const top = this.game().iboState.deckPile[0] ?? ActionCardIcon.Construct;
      this.drawnCardForSlot.set(top);
    } else if (mode === 'roll') {
      const die = Math.ceil(Math.random() * 6);
      this.rolledDie.set(die);
      // Map d6 → card icon (same distribution as deck: 1-2=Adv, 3=Rec, 4=Att, 5=Con, 6=IC)
      const map: Record<number, ActionCardIcon> = {
        1: ActionCardIcon.Advance1, 2: ActionCardIcon.Advance2,
        3: ActionCardIcon.Recruit,  4: ActionCardIcon.Attack,
        5: ActionCardIcon.Construct, 6: ActionCardIcon.InfluenceCulture,
      };
      this.rolledCard.set(map[die]);
    }
    // manual: user picks, nothing to prepare
  }

  /** Called when a card is confirmed (auto or manual). */
  confirmCard(icon: ActionCardIcon) {
    const mode = this.game().cardDrawMode;

    // If deck mode, remove the drawn card from the pile and add to discard
    if (mode === 'deck') {
      const s = structuredClone(this.game().iboState);
      const idx = s.deckPile.indexOf(icon);
      if (idx >= 0) s.deckPile.splice(idx, 1);
      s.discardPile.push(icon);
      this.stateChanged.emit(s);
    }

    const newCards = [...this.resolvedCards(), icon];
    this.resolvedCards.set(newCards);

    const p = this.phase() as Extract<Phase, { kind: 'drawing' }>;
    const next = p.cardIndex + 1;

    if (next < p.totalCards) {
      this.phase.set({ kind: 'drawing', cardIndex: next, totalCards: p.totalCards });
      this.prepareNextDraw(next);
    } else {
      // All cards drawn — run AI
      this.runAI(newCards, {});
    }
  }

  private runAI(cards: ActionCardIcon[], inputs: Record<string, string | number | boolean>) {
    this.phase.set({ kind: 'resolving', cards });
    const result = this.ai.executeTurn(this.game(), cards, inputs);
    this.currentResult.set(result);

    if (result.pendingPrompts.length > 0) {
      this.phase.set({ kind: 'prompting', cards, prompts: result.pendingPrompts, answeredSoFar: inputs });
    } else {
      this.phase.set({ kind: 'done', result });
    }
  }

  continueWithAnswers() {
    const p = this.phase() as Extract<Phase, { kind: 'prompting' }>;
    const combined = { ...p.answeredSoFar, ...this.answers() };
    this.answers.set({});
    this.runAI(p.cards, combined);
  }

  finalizeTurn() {
    const p = this.phase() as Extract<Phase, { kind: 'done' }>;
    this.turnCompleted.emit({ record: p.result.record, updatedState: p.result.updatedState });
    this.phase.set({ kind: 'idle' });
    this.resolvedCards.set([]);
    this.currentResult.set(null);
  }

  cancelTurn() {
    this.phase.set({ kind: 'idle' });
    this.resolvedCards.set([]);
    this.currentResult.set(null);
    this.answers.set({});
  }

  executeStatusPhase() {
    const result = this.ai.executeStatusPhase(this.game());
    const record: TurnRecord = {
      turn: this.game().currentTurn + 1,
      age: this.game().currentAge,
      steps: result.steps,
      timestamp: new Date().toISOString(),
    };
    this.turnCompleted.emit({ record, updatedState: result.updatedState });
  }

  // ── Prompt answers ───────────────────────────────────────────────────────
  getAnswer(key: string): string | number | boolean | undefined { return this.answers()[key]; }
  setAnswer(key: string, value: string | number | boolean) {
    this.answers.update(a => ({ ...a, [key]: value }));
  }

  // ── Deck management ──────────────────────────────────────────────────────
  reshuffleDeck() {
    const s = structuredClone(this.game().iboState);
    const combined = shuffleDeck([...s.deckPile, ...s.discardPile]);
    s.deckPile = combined;
    s.discardPile = [];
    this.stateChanged.emit(s);
  }

  // ── State adjustments ────────────────────────────────────────────────────
  adjustAge(delta: number) {
    this.ageChanged.emit(Math.max(1, Math.min(6, this.game().currentAge + delta)));
  }
  adjustCulture(delta: number) {
    const s = { ...this.game().iboState, cultureTokens: Math.max(0, this.game().iboState.cultureTokens + delta) };
    this.stateChanged.emit(s);
  }
  adjustCards(delta: number) {
    const s = { ...this.game().iboState, actionCardCount: Math.max(0, this.game().iboState.actionCardCount + delta) };
    this.stateChanged.emit(s);
  }
  adjustCaptives(delta: number) {
    const s = { ...this.game().iboState, captives: Math.max(0, this.game().iboState.captives + delta) };
    this.stateChanged.emit(s);
  }

  private cardsThisTurn(): number {
    const { difficulty, currentAge } = this.game();
    const table: Record<string, number[]> = {
      Easy:   [1,1,1,2,2,3], Easier: [1,1,2,2,2,3],
      Normal: [1,1,2,2,3,3], Harder: [1,2,2,2,3,3], Hard: [1,2,2,3,3,3],
    };
    return table[difficulty]?.[currentAge - 1] ?? 1;
  }
}
