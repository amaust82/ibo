import { Component, input, output } from '@angular/core';
import { Advancements, AdvCat } from '../../../../core/models/game.models';

interface AdvRow {
  cat: string;
  key: keyof Advancements;
  icon: string;
}

const ADV_ROWS: AdvRow[] = [
  { cat: 'Agriculture', key: 'agriculture', icon: '🌾' },
  { cat: 'Construction', key: 'construction', icon: '🏗' },
  { cat: 'Maritime', key: 'maritime', icon: '⚓' },
  { cat: 'Education', key: 'education', icon: '📚' },
  { cat: 'Warfare', key: 'warfare', icon: '⚔️' },
  { cat: 'Spirituality', key: 'spirituality', icon: '✨' },
  { cat: 'Economy', key: 'economy', icon: '💰' },
  { cat: 'Traditions', key: 'traditions', icon: '🏛' },
  { cat: 'Science', key: 'science', icon: '🔬' },
];

@Component({
  selector: 'app-ibo-advancements',
  standalone: true,
  template: `
    <div class="adv-panel">
      <h3 class="panel-title">Advancements</h3>
      <div class="adv-grid">
        @for (row of rows; track row.key) {
          <div class="adv-row">
            <span class="adv-icon" [title]="row.cat">{{ row.icon }}</span>
            <span class="adv-name">{{ row.cat }}</span>
            <div class="adv-pips">
              @for (pip of [1,2,3,4]; track pip) {
                <div
                  class="pip"
                  [class.filled]="getLevel(row.key) >= pip"
                  (click)="toggleLevel(row.key, pip)">
                </div>
              }
            </div>
            <span class="adv-level">{{ getLevel(row.key) }}/4</span>
          </div>
        }

        <!-- Government -->
        <div class="adv-row gov-row">
          <span class="adv-icon">👑</span>
          <span class="adv-name">
            @if (advancements().government) {
              {{ advancements().government }}
            } @else {
              Government
            }
          </span>
          <div class="adv-pips">
            @for (pip of [1,2,3,4]; track pip) {
              <div class="pip" [class.filled]="advancements().governmentLevel >= pip"
                (click)="toggleGovLevel(pip)">
              </div>
            }
          </div>
          <span class="adv-level">{{ advancements().governmentLevel }}/4</span>
        </div>
      </div>

      @if (!advancements().government) {
        <div class="gov-hint">No government chosen yet</div>
      }
    </div>
  `,
  styles: [`
    .adv-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: .75rem; }
    .panel-title { font-size: .9rem; font-weight: 700; color: var(--text-muted); margin: 0 0 .75rem; text-transform: uppercase; letter-spacing: .05em; }
    .adv-grid { display: flex; flex-direction: column; gap: .3rem; }
    .adv-row {
      display: flex; align-items: center; gap: .5rem;
      padding: .2rem .3rem; border-radius: 4px;
      transition: background .1s;
    }
    .adv-row:hover { background: var(--border); }
    .adv-icon { font-size: .9rem; width: 1.2rem; text-align: center; }
    .adv-name { font-size: .8rem; min-width: 90px; flex: 1; }
    .adv-pips { display: flex; gap: 3px; }
    .pip {
      width: 14px; height: 14px; border-radius: 50%;
      border: 1.5px solid var(--border); cursor: pointer;
      transition: background .1s, border-color .1s;
    }
    .pip.filled { background: var(--accent); border-color: var(--accent); }
    .adv-level { font-size: .7rem; color: var(--text-muted); min-width: 2rem; text-align: right; }
    .gov-row { border-top: 1px solid var(--border); margin-top: .3rem; padding-top: .5rem; }
    .gov-hint { font-size: .75rem; color: var(--text-muted); margin-top: .3rem; text-align: center; }
  `],
})
export class IboAdvancementsComponent {
  advancements = input.required<Advancements>();
  advancementsChange = output<Advancements>();

  rows = ADV_ROWS;

  getLevel(key: keyof Advancements): number {
    const val = this.advancements()[key];
    return typeof val === 'number' ? val : 0;
  }

  toggleLevel(key: keyof Advancements, pip: number) {
    const current = this.getLevel(key);
    const newLevel = current === pip ? pip - 1 : pip;
    const updated = { ...this.advancements(), [key]: Math.max(0, Math.min(4, newLevel)) };
    this.advancementsChange.emit(updated);
  }

  toggleGovLevel(pip: number) {
    const current = this.advancements().governmentLevel;
    const newLevel = current === pip ? pip - 1 : pip;
    const updated = { ...this.advancements(), governmentLevel: Math.max(0, Math.min(4, newLevel)) };
    this.advancementsChange.emit(updated);
  }
}
