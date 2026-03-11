import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { DbService } from '../../core/services/db.service';
import { Game } from '../../core/models/game.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DatePipe, TitleCasePipe],
  template: `
    <div class="home">
      <header class="home-header">
        <h1>IBO Companion</h1>
        <p class="subtitle">Clash of Cultures: Monumental Edition — Solo Mode</p>
      </header>

      <div class="home-actions">
        <button class="btn btn-primary btn-large" (click)="newGame()">+ New Game</button>
      </div>

      @if (loading()) {
        <div class="loading">Loading saved games…</div>
      } @else if (games().length === 0) {
        <div class="empty-state">
          <p>No saved games yet.</p>
          <p>Start a new game to get playing!</p>
        </div>
      } @else {
        <section class="game-list">
          <h2>Saved Games</h2>
          <div class="game-cards">
            @for (game of games(); track game.id) {
              <div class="game-card">
                <div class="game-card-info" (click)="loadGame(game)">
                  <h3>{{ game.name }}</h3>
                  <div class="game-meta">
                    <span class="badge badge-age">Age {{ game.currentAge }}</span>
                    <span class="badge badge-diff">{{ game.difficulty }}</span>
                    @if (game.civId) {
                      <span class="badge badge-civ">{{ game.civId | titlecase }}</span>
                    }
                  </div>
                  <div class="game-date">Updated: {{ game.updatedAt | date:'short' }}</div>
                </div>
                <button
                  class="btn btn-danger btn-sm"
                  title="Delete game"
                  (click)="confirmDelete(game, $event)">
                  ✕
                </button>
              </div>
            }
          </div>
        </section>
      }

      @if (deleteTarget()) {
        <div class="modal-backdrop" (click)="cancelDelete()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Delete "{{ deleteTarget()!.name }}"?</h3>
            <p>This cannot be undone.</p>
            <div class="modal-actions">
              <button class="btn btn-danger" (click)="doDelete()">Delete</button>
              <button class="btn btn-secondary" (click)="cancelDelete()">Cancel</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .home {
      max-width: 640px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }
    .home-header { text-align: center; margin-bottom: 2rem; }
    .home-header h1 {
      font-size: 2.2rem; color: var(--accent); margin-bottom: .25rem;
      text-shadow: 0 0 30px rgba(212,168,48,.35), 0 2px 4px rgba(0,0,0,.5);
      letter-spacing: .04em;
    }
    .subtitle {
      color: var(--text-muted); font-size: .85rem; letter-spacing: .06em;
      text-transform: uppercase;
    }
    .home-actions { display: flex; justify-content: center; margin-bottom: 2rem; }
    .game-list h2 { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1rem; }
    .game-cards { display: flex; flex-direction: column; gap: .75rem; }
    .game-card {
      display: flex; align-items: center; gap: .5rem;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: .75rem 1rem; cursor: pointer;
      transition: border-color .15s, box-shadow .15s;
    }
    .game-card:hover {
      border-color: var(--accent);
      box-shadow: 0 0 12px rgba(212,168,48,.12);
    }
    .game-card-info { flex: 1; }
    .game-card h3 { margin: 0 0 .4rem; font-size: 1rem; }
    .game-meta { display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: .3rem; }
    .badge {
      font-size: .7rem; padding: .15rem .4rem; border-radius: 4px; font-weight: 600;
    }
    .badge-age  { background: #2a1e08; color: #c8a040; }
    .badge-diff { background: #1e2808; color: #78a838; }
    .badge-civ  { background: #28180a; color: #c09030; }
    .game-date { font-size: .75rem; color: var(--text-muted); }
    .empty-state { text-align: center; color: var(--text-muted); padding: 3rem 0; }
    .loading { text-align: center; color: var(--text-muted); padding: 2rem; }
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.6);
      display: flex; align-items: center; justify-content: center; z-index: 100;
    }
    .modal {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; padding: 1.5rem; min-width: 280px; max-width: 400px;
    }
    .modal h3 { margin: 0 0 .5rem; }
    .modal p { color: var(--text-muted); margin-bottom: 1rem; }
    .modal-actions { display: flex; gap: .5rem; justify-content: flex-end; }
  `],
})
export class HomeComponent implements OnInit {
  games = signal<Game[]>([]);
  loading = signal(true);
  deleteTarget = signal<Game | null>(null);

  constructor(private db: DbService, private router: Router) {}

  async ngOnInit() {
    this.games.set(await this.db.listGames());
    this.loading.set(false);
  }

  newGame() {
    this.router.navigate(['/new-game']);
  }

  loadGame(game: Game) {
    this.router.navigate(['/game', game.id]);
  }

  confirmDelete(game: Game, e: MouseEvent) {
    e.stopPropagation();
    this.deleteTarget.set(game);
  }

  cancelDelete() {
    this.deleteTarget.set(null);
  }

  async doDelete() {
    const target = this.deleteTarget();
    if (!target?.id) return;
    await this.db.deleteGame(target.id);
    this.games.update(list => list.filter(g => g.id !== target.id));
    this.deleteTarget.set(null);
  }
}
