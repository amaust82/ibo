import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '../../core/services/db.service';
import { GameStateService } from '../../core/services/game-state.service';
import { Game, IboState, TurnRecord } from '../../core/models/game.models';
import { CIVILIZATIONS } from '../../core/data/civilizations.data';
import { CIV_LEADERS } from '../../core/data/leaders.data';
import { IboScaleComponent } from './components/ibo-scale/ibo-scale.component';
import { IboAdvancementsComponent } from './components/ibo-advancements/ibo-advancements.component';
import { IboCitiesComponent } from './components/ibo-cities/ibo-cities.component';
import { TurnExecutorComponent } from './components/turn-executor/turn-executor.component';
import { TurnLogComponent } from './components/turn-log/turn-log.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    IboScaleComponent,
    IboAdvancementsComponent,
    IboCitiesComponent,
    TurnExecutorComponent,
    TurnLogComponent,
  ],
  template: `
    @if (game(); as g) {
      <div class="game-layout">
        <!-- Top Bar -->
        <header class="game-header">
          <button class="btn btn-ghost btn-sm" (click)="goHome()">← Home</button>
          <div class="game-title">
            <span class="game-name">{{ g.name }}</span>
            @if (g.civId) {
              <span class="civ-badge">{{ civName(g.civId) }}</span>
            }
            @if (g.leaderId && g.leaderId !== 'none') {
              <span class="leader-badge">{{ leaderName(g.civId, g.leaderId) }}</span>
            }
          </div>
          <div class="header-meta">
            <span class="badge-diff">{{ g.difficulty }}</span>
            @if (g.shorterGame) { <span class="badge-short">Age IV</span> }
          </div>
        </header>

        <!-- Civ / Leader abilities quick reference -->
        @if (g.civId) {
          <div class="civ-banner" [class.collapsed]="!showCivInfo()">
            <button class="civ-toggle" (click)="toggleCivInfo()">
              {{ civName(g.civId) }} Civ Abilities {{ showCivInfo() ? '▲' : '▼' }}
            </button>
            @if (showCivInfo()) {
              <div class="civ-abilities">
                @for (ability of civAbilities(g.civId); track ability.name) {
                  <div class="ability-chip">
                    <strong>{{ ability.name }}</strong>: {{ ability.aiNote }}
                  </div>
                }
                @if (g.leaderId && g.leaderId !== 'none' && g.leaderId !== 'random') {
                  <div class="ability-chip leader-chip">
                    <strong>Leader – {{ leaderName(g.civId, g.leaderId) }}</strong>: {{ leaderAbility(g.civId, g.leaderId) }}
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Main Content -->
        <div class="game-content">
          <!-- Left Column: State -->
          <div class="state-col">
            <app-ibo-scale [scale]="g.iboState.scale" />
            <app-ibo-advancements
              [advancements]="g.iboState.advancements"
              (advancementsChange)="onAdvancementsChange($event, g)" />
            <app-ibo-cities
              [iboState]="g.iboState"
              (stateChange)="onIboStateChange($event, g)" />

            <!-- Wonders -->
            @if (g.iboState.wonders.length > 0) {
              <div class="wonders-panel">
                <div class="panel-title">Wonders Built</div>
                <div class="wonder-list">
                  @for (w of g.iboState.wonders; track w) {
                    <span class="wonder-badge">🏆 {{ w }}</span>
                  }
                </div>
              </div>
            }

            <!-- Leader Status -->
            @if (g.leaderId && g.leaderId !== 'none') {
              <div class="leader-panel">
                <div class="panel-title">Leader Status</div>
                <div class="leader-status">
                  <span>{{ leaderName(g.civId, g.leaderId) }}</span>
                  <button type="button" class="btn btn-sm btn-toggle"
                    [class.active]="g.iboState.leaderOnBoard"
                    (click)="toggleLeaderOnBoard(g)">
                    {{ g.iboState.leaderOnBoard ? '📍 On Board' : '⬜ Not on Board' }}
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Right Column: Turn Control + Log -->
          <div class="turn-col">
            <app-turn-executor
              [game]="g"
              (turnCompleted)="onTurnCompleted($event, g)"
              (stateChanged)="onIboStateChange($event, g)"
              (ageChanged)="onAgeChanged($event, g)" />
            <app-turn-log #logComponent [history]="g.turnHistory" />
          </div>
        </div>
      </div>
    } @else {
      <div class="loading">Loading game…</div>
    }
  `,
  styles: [`
    .game-layout { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }
    .game-header {
      display: flex; align-items: center; gap: .75rem; padding: .5rem .75rem;
      background: var(--surface); border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .game-title { flex: 1; display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; }
    .game-name { font-weight: 700; font-size: 1rem; }
    .civ-badge   { font-size: .7rem; padding: .1rem .4rem; border-radius: 4px; background: #28180a; color: #c89030; }
    .leader-badge{ font-size: .7rem; padding: .1rem .4rem; border-radius: 4px; background: #2e2208; color: #e0c060; }
    .badge-diff  { font-size: .7rem; padding: .1rem .4rem; border-radius: 4px; background: #1e2808; color: #78a838; }
    .badge-short { font-size: .7rem; padding: .1rem .4rem; border-radius: 4px; background: #2a1a0a; color: #c07050; }
    .header-meta { display: flex; gap: .3rem; }

    /* Civ Banner */
    .civ-banner {
      background: rgba(212,168,48,.04); border-bottom: 1px solid rgba(212,168,48,.18);
      padding: .3rem .75rem;
    }
    .civ-toggle {
      background: none; border: none; color: var(--accent); cursor: pointer; font-size: .8rem;
      font-weight: 600; padding: 0; font-family: 'Inter', system-ui, sans-serif;
    }
    .civ-toggle:hover { color: #e8bc38; }
    .civ-abilities { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .4rem; }
    .ability-chip {
      font-size: .72rem; padding: .2rem .5rem; border-radius: 4px;
      background: rgba(212,168,48,.07); border: 1px solid rgba(212,168,48,.18); color: var(--text);
    }
    .leader-chip { border-color: rgba(224,192,96,.3); background: rgba(224,192,96,.08); }

    /* Main layout */
    .game-content {
      flex: 1; overflow: hidden; display: grid;
      grid-template-columns: 1fr 1fr;
      gap: .75rem; padding: .75rem;
    }
    @media (max-width: 700px) {
      .game-content { grid-template-columns: 1fr; overflow-y: auto; }
    }
    .state-col { display: flex; flex-direction: column; gap: .6rem; overflow-y: auto; }
    .turn-col { display: flex; flex-direction: column; gap: .6rem; overflow-y: auto; }
    .turn-col app-turn-log { flex: 1; min-height: 200px; }

    /* Extra panels */
    .wonders-panel, .leader-panel {
      background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: .6rem;
    }
    .panel-title { font-size: .8rem; font-weight: 700; color: var(--text-muted); margin-bottom: .4rem; text-transform: uppercase; letter-spacing: .05em; }
    .wonder-list { display: flex; flex-wrap: wrap; gap: .3rem; }
    .wonder-badge { font-size: .8rem; padding: .2rem .5rem; border-radius: 4px; background: rgba(255,200,50,.1); border: 1px solid rgba(255,200,50,.3); }
    .leader-status { display: flex; align-items: center; justify-content: space-between; gap: .5rem; font-size: .85rem; }
    .btn-toggle { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: .25rem .6rem; border-radius: 4px; cursor: pointer; font-size: .8rem; }
    .btn-toggle.active { border-color: var(--accent); color: var(--accent); }
    .loading { display: flex; align-items: center; justify-content: center; height: 100dvh; color: var(--text-muted); }
  `],
})
export class GameComponent implements OnInit {
  game = signal<Game | null>(null);
  showCivInfo = signal(false);

  @ViewChild('logComponent') logComponent?: TurnLogComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DbService,
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const game = await this.db.loadGame(id);
    if (game) {
      this.game.set(game);
    } else {
      this.router.navigate(['/']);
    }
  }

  toggleCivInfo() {
    this.showCivInfo.update(v => !v);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  civName(civId: string | null): string {
    if (!civId) return '';
    return CIVILIZATIONS.find(c => c.id === civId)?.name ?? civId;
  }

  civAbilities(civId: string) {
    return CIVILIZATIONS.find(c => c.id === civId)?.abilities ?? [];
  }

  leaderName(civId: string | null, leaderId: string | null): string {
    if (!civId || !leaderId) return '';
    if (leaderId === 'random') return 'Random';
    return CIV_LEADERS.find(cl => cl.civId === civId)?.leaders.find(l => l.id === leaderId)?.name ?? leaderId;
  }

  leaderAbility(civId: string | null, leaderId: string | null): string {
    if (!civId || !leaderId) return '';
    return CIV_LEADERS.find(cl => cl.civId === civId)?.leaders.find(l => l.id === leaderId)?.aiNote ?? '';
  }

  onAdvancementsChange(advancements: any, g: Game) {
    this.game.update(cur => cur ? { ...cur, iboState: { ...cur.iboState, advancements } } : cur);
    this.saveGame();
  }

  onIboStateChange(state: IboState, g: Game) {
    this.game.update(cur => cur ? { ...cur, iboState: state } : cur);
    this.saveGame();
  }

  onAgeChanged(age: number, g: Game) {
    this.game.update(cur => cur ? { ...cur, currentAge: age } : cur);
    this.saveGame();
  }

  onTurnCompleted(event: { record: TurnRecord; updatedState: IboState }, g: Game) {
    this.game.update(cur => {
      if (!cur) return cur;
      return {
        ...cur,
        currentTurn: cur.currentTurn + 1,
        iboState: event.updatedState,
        turnHistory: [...cur.turnHistory, event.record],
      };
    });
    this.saveGame();
    setTimeout(() => this.logComponent?.scrollToBottom(), 50);
  }

  toggleLeaderOnBoard(g: Game) {
    this.game.update(cur => cur ? {
      ...cur,
      iboState: { ...cur.iboState, leaderOnBoard: !cur.iboState.leaderOnBoard },
    } : cur);
    this.saveGame();
  }

  private async saveGame() {
    const g = this.game();
    if (g) await this.db.saveGame(g);
  }
}
