import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DbService } from '../../core/services/db.service';
import { GameStateService, createNewGame } from '../../core/services/game-state.service';
import { Difficulty, CardDrawMode } from '../../core/models/game.models';
import { CIVILIZATIONS, Civilization } from '../../core/data/civilizations.data';
import { CIV_LEADERS, Leader } from '../../core/data/leaders.data';

@Component({
  selector: 'app-new-game',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="new-game">
      <header class="ng-header">
        <button class="btn btn-ghost" (click)="back()">← Back</button>
        <h1>New Game</h1>
      </header>

      <form class="ng-form" (ngSubmit)="startGame()">
        <!-- Game Name -->
        <section class="form-section">
          <label class="form-label" for="gameName">Game Name</label>
          <input
            id="gameName"
            class="form-input"
            type="text"
            [(ngModel)]="gameName"
            name="gameName"
            placeholder="My Solo Campaign"
            required />
        </section>

        <!-- Difficulty -->
        <section class="form-section">
          <label class="form-label">Difficulty</label>
          <div class="button-group">
            @for (d of difficulties; track d) {
              <button
                type="button"
                class="btn btn-toggle"
                [class.active]="selectedDifficulty() === d"
                (click)="selectedDifficulty.set(d)">
                {{ d }}
              </button>
            }
          </div>
        </section>

        <!-- Card Draw Mode -->
        <section class="form-section">
          <label class="form-label">Card Draw Mode</label>
          <div class="draw-mode-options">
            @for (mode of drawModes; track mode.value) {
              <button
                type="button"
                class="draw-mode-btn"
                [class.active]="selectedDrawMode() === mode.value"
                (click)="selectedDrawMode.set(mode.value)">
                <span class="dm-icon">{{ mode.icon }}</span>
                <span class="dm-name">{{ mode.label }}</span>
                <span class="dm-desc">{{ mode.desc }}</span>
              </button>
            }
          </div>
          @if (selectedDrawMode() === 'deck') {
            <div class="draw-mode-note">
              <label>
                <input type="checkbox" [(ngModel)]="includeCivSpecific" name="includeCivSpecific" />
                Include Civ Specific cards (🌟) in deck
              </label>
            </div>
          }
        </section>

        <!-- Shorter Game -->
        <section class="form-section row">
          <label class="form-label" for="shorterGame">Shorter Game (ends Age IV)</label>
          <input id="shorterGame" type="checkbox" [(ngModel)]="shorterGame" name="shorterGame" />
        </section>

        <!-- Civilization -->
        <section class="form-section">
          <div class="section-header">
            <label class="form-label">Civilization</label>
            <button type="button" class="btn btn-sm btn-ghost" (click)="randomizeCiv()">🎲 Random</button>
          </div>
          <div class="civ-grid">
            <button
              type="button"
              class="civ-btn"
              [class.active]="selectedCivId() === null"
              (click)="selectCiv(null)">
              None
            </button>
            @for (civ of civs; track civ.id) {
              <button
                type="button"
                class="civ-btn"
                [class.active]="selectedCivId() === civ.id"
                (click)="selectCiv(civ.id)">
                {{ civ.name }}
              </button>
            }
          </div>

          @if (selectedCiv(); as civ) {
            <div class="civ-detail">
              <h4>{{ civ.name }} Abilities</h4>
              @if (civ.setupNote) {
                <div class="setup-note">⚠️ Setup: {{ civ.setupNote }}</div>
              }
              <ul>
                @for (ability of civ.abilities; track ability.name) {
                  <li>
                    <strong>{{ ability.name }}</strong>
                    @if (ability.triggerCat) {
                      <span class="trigger-badge">{{ ability.triggerCat }} {{ ability.triggerCount }}</span>
                    }
                    <p>{{ ability.aiNote }}</p>
                  </li>
                }
              </ul>
            </div>
          }
        </section>

        <!-- Leader -->
        <section class="form-section">
          <div class="section-header">
            <label class="form-label">Leader</label>
            <button type="button" class="btn btn-sm btn-ghost" (click)="randomizeLeader()">🎲 Random</button>
          </div>

          @if (!selectedCivId()) {
            <p class="form-hint">Select a Civilization to choose a Leader.</p>
          } @else {
            <div class="leader-grid">
              <button
                type="button"
                class="leader-btn"
                [class.active]="selectedLeaderId() === 'none'"
                (click)="selectedLeaderId.set('none')">
                No Leader
              </button>
              <button
                type="button"
                class="leader-btn"
                [class.active]="selectedLeaderId() === 'random'"
                (click)="selectedLeaderId.set('random')">
                Random at recruit
              </button>
              @for (leader of availableLeaders(); track leader.id) {
                <button
                  type="button"
                  class="leader-btn"
                  [class.active]="selectedLeaderId() === leader.id"
                  (click)="selectedLeaderId.set(leader.id)">
                  {{ leader.name }}
                </button>
              }
            </div>

            @if (selectedLeader(); as leader) {
              <div class="leader-detail">
                <strong>{{ leader.name }}:</strong> {{ leader.aiNote }}
              </div>
            }
          }
        </section>

        <div class="form-actions">
          <button class="btn btn-primary btn-large" type="submit" [disabled]="!gameName.trim()">
            Start Game
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .new-game { max-width: 640px; margin: 0 auto; padding: 1rem; }
    .ng-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .ng-header h1 { font-size: 1.5rem; margin: 0; }
    .ng-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-section { display: flex; flex-direction: column; gap: .5rem; }
    .form-section.row { flex-direction: row; align-items: center; gap: 1rem; }
    .form-label { font-weight: 600; font-size: .9rem; color: var(--text-muted); }
    .form-input {
      background: var(--surface); border: 1px solid var(--border);
      color: var(--text); padding: .6rem .8rem; border-radius: 6px;
      font-size: 1rem; font-family: inherit;
    }
    .form-input:focus { outline: none; border-color: var(--accent); }
    .form-hint { color: var(--text-muted); font-size: .85rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; }
    .button-group { display: flex; flex-wrap: wrap; gap: .4rem; }
    .btn-toggle {
      background: var(--surface); border: 1px solid var(--border); color: var(--text);
      padding: .4rem .9rem; border-radius: 6px; cursor: pointer; font-size: .9rem;
    }
    .btn-toggle.active { background: var(--accent); color: #000; border-color: var(--accent); }
    .civ-grid, .leader-grid {
      display: flex; flex-wrap: wrap; gap: .4rem;
    }
    .civ-btn, .leader-btn {
      background: var(--surface); border: 1px solid var(--border); color: var(--text);
      padding: .35rem .7rem; border-radius: 6px; cursor: pointer; font-size: .85rem;
      transition: border-color .15s;
    }
    .civ-btn.active, .leader-btn.active {
      border-color: var(--accent); background: rgba(255,200,80,.1); color: var(--accent);
    }
    .civ-detail {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: .75rem 1rem; margin-top: .5rem;
    }
    .civ-detail h4 { margin: 0 0 .5rem; font-size: .95rem; }
    .setup-note {
      background: rgba(255,180,0,.1); border: 1px solid rgba(255,180,0,.3);
      border-radius: 4px; padding: .4rem .6rem; font-size: .8rem; margin-bottom: .5rem;
    }
    .civ-detail ul { margin: 0; padding-left: 1rem; }
    .civ-detail li { margin-bottom: .4rem; font-size: .85rem; }
    .civ-detail li p { margin: .1rem 0 0; color: var(--text-muted); }
    .trigger-badge {
      font-size: .7rem; background: var(--border); border-radius: 4px;
      padding: .1rem .35rem; margin-left: .3rem; vertical-align: middle;
    }
    .leader-detail {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 6px; padding: .5rem .75rem; font-size: .85rem; margin-top: .4rem;
      color: var(--text-muted);
    }
    .form-actions { padding-top: .5rem; }
    .btn-large { width: 100%; padding: .8rem; font-size: 1rem; }
    /* Draw mode */
    .draw-mode-options { display: flex; gap: .5rem; flex-wrap: wrap; }
    .draw-mode-btn {
      flex: 1; min-width: 130px; display: flex; flex-direction: column; align-items: center; gap: .2rem;
      background: var(--surface); border: 1.5px solid var(--border); border-radius: 8px;
      padding: .6rem .5rem; cursor: pointer; font-family: inherit; transition: border-color .15s;
    }
    .draw-mode-btn:hover { border-color: var(--text-muted); }
    .draw-mode-btn.active { border-color: var(--accent); background: rgba(240,192,64,.06); }
    .dm-icon { font-size: 1.4rem; }
    .dm-name { font-size: .85rem; font-weight: 700; }
    .dm-desc { font-size: .72rem; color: var(--text-muted); text-align: center; }
    .draw-mode-note { font-size: .82rem; color: var(--text-muted); display: flex; align-items: center; gap: .4rem; }
    .draw-mode-note label { display: flex; align-items: center; gap: .4rem; }
  `],
})
export class NewGameComponent {
  civs = CIVILIZATIONS;
  difficulties = Object.values(Difficulty);

  drawModes: { value: CardDrawMode; icon: string; label: string; desc: string }[] = [
    { value: 'deck',   icon: '🂠', label: 'Deck',   desc: '42-card pile, tracks draws' },
    { value: 'roll',   icon: '🎲', label: 'Die Roll', desc: 'Roll d6 each card (no tracking)' },
    { value: 'manual', icon: '✋', label: 'Manual',  desc: 'You enter each card icon' },
  ];

  gameName = '';
  shorterGame = false;
  includeCivSpecific = false;
  selectedDifficulty = signal<Difficulty>(Difficulty.Normal);
  selectedDrawMode   = signal<CardDrawMode>('deck');
  selectedCivId = signal<string | null>(null);
  selectedLeaderId = signal<string>('none');

  selectedCiv = computed<Civilization | undefined>(() =>
    this.civs.find(c => c.id === this.selectedCivId()),
  );

  availableLeaders = computed<Leader[]>(() => {
    const civId = this.selectedCivId();
    if (!civId) return [];
    return CIV_LEADERS.find(cl => cl.civId === civId)?.leaders ?? [];
  });

  selectedLeader = computed<Leader | undefined>(() => {
    const id = this.selectedLeaderId();
    if (!id || id === 'none' || id === 'random') return undefined;
    return this.availableLeaders().find(l => l.id === id);
  });

  constructor(
    private db: DbService,
    private gameState: GameStateService,
    private router: Router,
  ) {}

  back() {
    this.router.navigate(['/']);
  }

  selectCiv(id: string | null) {
    this.selectedCivId.set(id);
    this.selectedLeaderId.set('none');
  }

  randomizeCiv() {
    const random = this.civs[Math.floor(Math.random() * this.civs.length)];
    this.selectCiv(random.id);
  }

  randomizeLeader() {
    const leaders = this.availableLeaders();
    if (!leaders.length) {
      this.selectedLeaderId.set('none');
      return;
    }
    const random = leaders[Math.floor(Math.random() * leaders.length)];
    this.selectedLeaderId.set(random.id);
  }

  async startGame() {
    if (!this.gameName.trim()) return;

    const civId = this.selectedCivId();
    const civ = this.selectedCiv();
    const leaderId = this.selectedLeaderId() === 'none' ? null : this.selectedLeaderId();

    const game = createNewGame(
      this.gameName.trim(),
      this.selectedDifficulty(),
      civId,
      leaderId,
      this.selectedDrawMode(),
      this.includeCivSpecific,
      civ?.setupNote,
      this.shorterGame,
    );

    const id = await this.db.saveGame(game);
    game.id = id;
    this.gameState.loadGame(game);
    this.router.navigate(['/game', id]);
  }
}
