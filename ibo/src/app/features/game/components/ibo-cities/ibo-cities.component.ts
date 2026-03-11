import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  City, IboState, CityPiece, ArmyUnit, Mood, Resource,
} from '../../../../core/models/game.models';

const PIECE_ICONS: Partial<Record<CityPiece, string>> = {
  [CityPiece.Port]: '⚓',
  [CityPiece.Academy]: '🎓',
  [CityPiece.Fortress]: '🏰',
  [CityPiece.Temple]: '⛩',
  [CityPiece.Market]: '🏪',
  [CityPiece.Obelisk]: '🗿',
  [CityPiece.Observatory]: '🔭',
};

const UNIT_ICONS: Record<ArmyUnit, string> = {
  [ArmyUnit.Infantry]: '⚔',
  [ArmyUnit.Cavalry]: '🐴',
  [ArmyUnit.Elephant]: '🐘',
  [ArmyUnit.Leader]: '👑',
};

const MOOD_LABELS: Record<Mood, string> = {
  [Mood.Happy]: 'Happy',
  [Mood.Neutral]: 'Neutral',
  [Mood.Angry]: 'Angry',
};

@Component({
  selector: 'app-ibo-cities',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="cities-panel">
      <div class="cities-header">
        <h3 class="panel-title">Cities</h3>
        <div class="settler-info">
          Settler: <strong>{{ settlerCityResource() }}</strong>
        </div>
        <button class="btn btn-sm btn-ghost" (click)="addCity()">+ Add City</button>
      </div>

      <div class="city-list">
        @for (city of orderedCities(); track city.id; let i = $index) {
          <div class="city-card" [class.editing]="editingId() === city.id"
               [class.angry]="city.mood === -1" [class.happy]="city.mood === 1">
            <div class="city-row" (click)="toggleEdit(city.id)">
              <div class="city-order">{{ i + 1 }}</div>
              <div class="city-resource">{{ resourceIcon(city.resource) }} {{ city.resource }}</div>
              <div class="city-mood mood-badge" [class]="moodClass(city.mood)">{{ moodLabel(city.mood) }}</div>
              <div class="city-pieces">
                @for (piece of city.cityPieces; track piece) {
                  <span [title]="piece">{{ pieceIcon(piece) }}</span>
                }
                @if (city.hasWonder) { <span title="Wonder">🏆</span> }
              </div>
              <div class="city-units">
                @for (unit of city.armyUnits; track $index) {
                  <span [title]="unit">{{ unitIcon(unit) }}</span>
                }
              </div>
              @if (city.ships > 0) {
                <div class="city-ships">🚢×{{ city.ships }}</div>
              }
              @if (city.underInfluence) {
                <div class="influenced-badge">Influenced</div>
              }
              @if (iboState().settlerCityId === city.id) {
                <div class="settler-marker" title="Settler here">🏕</div>
              }
            </div>

            @if (editingId() === city.id) {
              <div class="city-edit" (click)="$event.stopPropagation()">
                <!-- Mood -->
                <div class="edit-row">
                  <label>Mood</label>
                  <div class="button-group">
                    @for (m of moods; track m.val) {
                      <button type="button" class="btn btn-sm btn-toggle"
                        [class.active]="city.mood === m.val"
                        (click)="setMood(city, m.val)">{{ m.label }}</button>
                    }
                  </div>
                </div>

                <!-- City Pieces -->
                <div class="edit-row">
                  <label>City Pieces</label>
                  <div class="piece-toggles">
                    @for (piece of nonSettlementPieces; track piece) {
                      <button type="button" class="btn btn-sm btn-toggle"
                        [class.active]="city.cityPieces.includes(piece)"
                        (click)="togglePiece(city, piece)">
                        {{ pieceIcon(piece) }} {{ piece }}
                      </button>
                    }
                  </div>
                </div>

                <!-- Army Units -->
                <div class="edit-row">
                  <label>Army Units</label>
                  <div class="unit-editor">
                    @for (unitType of unitTypes; track unitType) {
                      <div class="unit-row">
                        <span>{{ unitIcon(unitType) }} {{ unitType }}</span>
                        <div class="unit-counter">
                          <button type="button" class="btn btn-sm" (click)="removeUnit(city, unitType)">−</button>
                          <span>{{ countUnits(city, unitType) }}</span>
                          <button type="button" class="btn btn-sm" (click)="addUnit(city, unitType)">+</button>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Ships -->
                <div class="edit-row">
                  <label>Ships</label>
                  <div class="unit-counter">
                    <button type="button" class="btn btn-sm" (click)="adjustShips(city, -1)">−</button>
                    <span>{{ city.ships }}</span>
                    <button type="button" class="btn btn-sm" (click)="adjustShips(city, 1)">+</button>
                  </div>
                </div>

                <!-- Toggles -->
                <div class="edit-row">
                  <label>
                    <input type="checkbox" [checked]="city.underInfluence"
                      (change)="toggleInfluence(city)" /> Under Player Influence
                  </label>
                  <label>
                    <input type="checkbox" [checked]="city.hasWonder"
                      (change)="toggleWonder(city)" /> Has Wonder
                  </label>
                  <label>
                    <input type="checkbox" [checked]="iboState().settlerCityId === city.id"
                      (change)="setSettler(city)" /> Settler Here
                  </label>
                </div>

                <!-- City Track Position -->
                <div class="edit-row">
                  <label>City-Track Position (1 = first)</label>
                  <input type="number" min="1" [max]="iboState().cities.length"
                    [value]="city.cityTrackIndex + 1"
                    (change)="moveCityTrack(city, +($any($event.target).value) - 1)" />
                </div>

                <div class="edit-actions">
                  <button type="button" class="btn btn-sm btn-danger" (click)="removeCity(city)">Remove City</button>
                  <button type="button" class="btn btn-sm btn-ghost" (click)="editingId.set(null)">Done</button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cities-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: .75rem; }
    .cities-header { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; margin-bottom: .75rem; }
    .panel-title { font-size: .9rem; font-weight: 700; color: var(--text-muted); margin: 0; text-transform: uppercase; letter-spacing: .05em; flex: 1; }
    .settler-info { font-size: .8rem; color: var(--accent); }
    .city-list { display: flex; flex-direction: column; gap: .4rem; }
    .city-card {
      border: 1px solid var(--border); border-radius: 6px;
      overflow: hidden; cursor: pointer;
    }
    .city-card.angry { border-color: #c05050; }
    .city-card.happy { border-color: #50a050; }
    .city-card.editing { border-color: var(--accent); }
    .city-row {
      display: flex; align-items: center; gap: .5rem;
      padding: .4rem .6rem; flex-wrap: wrap;
    }
    .city-order { font-size: .7rem; color: var(--text-muted); min-width: 1rem; }
    .city-resource { font-size: .85rem; font-weight: 600; min-width: 80px; }
    .mood-badge { font-size: .65rem; padding: .1rem .35rem; border-radius: 3px; font-weight: 600; }
    .mood-happy { background: #1a3a1a; color: #7ec87f; }
    .mood-neutral { background: #2a2a3a; color: #aaa; }
    .mood-angry { background: #3a1a1a; color: #e07070; }
    .city-pieces, .city-units { display: flex; gap: .2rem; font-size: .9rem; }
    .city-ships { font-size: .8rem; color: var(--text-muted); }
    .influenced-badge { font-size: .65rem; padding: .1rem .35rem; border-radius: 3px; background: #2a1a3a; color: #c07ef0; }
    .settler-marker { font-size: .9rem; }

    /* Edit panel */
    .city-edit {
      border-top: 1px solid var(--border); padding: .6rem; background: var(--bg);
      display: flex; flex-direction: column; gap: .6rem;
    }
    .edit-row { display: flex; flex-direction: column; gap: .3rem; }
    .edit-row label { font-size: .75rem; color: var(--text-muted); font-weight: 600; }
    .piece-toggles, .button-group { display: flex; flex-wrap: wrap; gap: .3rem; }
    .btn-toggle { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: .25rem .5rem; border-radius: 4px; cursor: pointer; font-size: .75rem; }
    .btn-toggle.active { border-color: var(--accent); background: rgba(255,200,80,.1); color: var(--accent); }
    .unit-editor { display: flex; flex-direction: column; gap: .25rem; }
    .unit-row { display: flex; align-items: center; justify-content: space-between; font-size: .8rem; }
    .unit-counter { display: flex; align-items: center; gap: .5rem; }
    .unit-counter span { min-width: 1.5rem; text-align: center; }
    .edit-actions { display: flex; gap: .4rem; justify-content: flex-end; padding-top: .3rem; border-top: 1px solid var(--border); }
    input[type=number] { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: .25rem .4rem; border-radius: 4px; width: 4rem; }
  `],
})
export class IboCitiesComponent {
  iboState = input.required<IboState>();
  stateChange = output<IboState>();

  editingId = signal<string | null>(null);

  nonSettlementPieces = [
    CityPiece.Port, CityPiece.Academy, CityPiece.Fortress,
    CityPiece.Temple, CityPiece.Market, CityPiece.Obelisk, CityPiece.Observatory,
  ];
  unitTypes = [ArmyUnit.Infantry, ArmyUnit.Cavalry, ArmyUnit.Elephant, ArmyUnit.Leader];
  moods = [
    { val: Mood.Happy, label: 'Happy' },
    { val: Mood.Neutral, label: 'Neutral' },
    { val: Mood.Angry, label: 'Angry' },
  ];

  orderedCities = computed<City[]>(() => {
    const s = this.iboState();
    return s.cityTrack
      .map(id => s.cities.find(c => c.id === id))
      .filter((c): c is City => !!c);
  });

  settlerCityResource = computed<string>(() => {
    const s = this.iboState();
    if (!s.settlerCityId) return 'None';
    return s.cities.find(c => c.id === s.settlerCityId)?.resource ?? 'None';
  });

  resourceIcon(r: Resource): string {
    const map: Record<Resource, string> = {
      [Resource.Food]: '🌾', [Resource.Wood]: '🪵', [Resource.Ore]: '⛏',
      [Resource.Gold]: '🪙', [Resource.Ideas]: '💡',
    };
    return map[r] ?? '';
  }

  pieceIcon(p: CityPiece): string { return PIECE_ICONS[p] ?? '?'; }
  unitIcon(u: ArmyUnit): string { return UNIT_ICONS[u]; }
  moodLabel(m: Mood): string { return MOOD_LABELS[m]; }
  moodClass(m: Mood): string {
    if (m === Mood.Happy) return 'mood-happy';
    if (m === Mood.Angry) return 'mood-angry';
    return 'mood-neutral';
  }
  countUnits(city: City, type: ArmyUnit): number {
    return city.armyUnits.filter(u => u === type).length;
  }

  toggleEdit(id: string) {
    this.editingId.update(cur => cur === id ? null : id);
  }

  private emit(updater: (s: IboState) => void) {
    const clone: IboState = JSON.parse(JSON.stringify(this.iboState()));
    updater(clone);
    // recalculate cityTrackIndex
    clone.cities.forEach(c => { c.cityTrackIndex = clone.cityTrack.indexOf(c.id); });
    this.stateChange.emit(clone);
  }

  private getCity(state: IboState, cityId: string): City {
    return state.cities.find(c => c.id === cityId)!;
  }

  setMood(city: City, mood: Mood) {
    this.emit(s => { this.getCity(s, city.id).mood = mood; });
  }

  togglePiece(city: City, piece: CityPiece) {
    this.emit(s => {
      const c = this.getCity(s, city.id);
      const idx = c.cityPieces.indexOf(piece);
      if (idx >= 0) {
        c.cityPieces.splice(idx, 1);
        c.size = Math.max(1, c.size - 1);
      } else {
        c.cityPieces.push(piece);
        c.size += 1;
      }
    });
  }

  addUnit(city: City, unit: ArmyUnit) {
    this.emit(s => { this.getCity(s, city.id).armyUnits.push(unit); });
  }

  removeUnit(city: City, unit: ArmyUnit) {
    this.emit(s => {
      const c = this.getCity(s, city.id);
      const idx = c.armyUnits.lastIndexOf(unit);
      if (idx >= 0) c.armyUnits.splice(idx, 1);
    });
  }

  adjustShips(city: City, delta: number) {
    this.emit(s => {
      const c = this.getCity(s, city.id);
      c.ships = Math.max(0, c.ships + delta);
    });
  }

  toggleInfluence(city: City) {
    this.emit(s => {
      const c = this.getCity(s, city.id);
      c.underInfluence = !c.underInfluence;
    });
  }

  toggleWonder(city: City) {
    this.emit(s => {
      const c = this.getCity(s, city.id);
      c.hasWonder = !c.hasWonder;
    });
  }

  setSettler(city: City) {
    this.emit(s => { s.settlerCityId = s.settlerCityId === city.id ? null : city.id; });
  }

  moveCityTrack(city: City, newIndex: number) {
    this.emit(s => {
      const oldIndex = s.cityTrack.indexOf(city.id);
      if (oldIndex < 0) return;
      const clamped = Math.max(0, Math.min(s.cityTrack.length - 1, newIndex));
      s.cityTrack.splice(oldIndex, 1);
      s.cityTrack.splice(clamped, 0, city.id);
    });
  }

  addCity() {
    const resources = Object.values(Resource);
    const usedResources = this.iboState().cities.map(c => c.resource);
    const available = resources.filter(r => !usedResources.includes(r));
    const resource = available[0] ?? Resource.Ideas;
    const id = resource + '_' + Date.now();

    this.emit(s => {
      s.cities.push({
        id, resource, cityTrackIndex: s.cities.length,
        cityPieces: [], hasSettlement: true,
        armyUnits: [ArmyUnit.Infantry], ships: 0,
        mood: Mood.Neutral, size: 1,
        underInfluence: false, hasWonder: false,
      });
      s.cityTrack.push(id);
    });
  }

  removeCity(city: City) {
    this.emit(s => {
      s.cities = s.cities.filter(c => c.id !== city.id);
      s.cityTrack = s.cityTrack.filter(id => id !== city.id);
      if (s.settlerCityId === city.id) s.settlerCityId = s.cities[0]?.id ?? null;
    });
    if (this.editingId() === city.id) this.editingId.set(null);
  }
}
