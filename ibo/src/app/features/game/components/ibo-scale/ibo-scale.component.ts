import { Component, input, output } from '@angular/core';
import { ScaleSlot, CityPiece, Resource } from '../../../../core/models/game.models';

const PIECE_ICONS: Record<CityPiece, string> = {
  [CityPiece.Settlement]: '🏠',
  [CityPiece.Port]: '⚓',
  [CityPiece.Academy]: '🎓',
  [CityPiece.Fortress]: '🏰',
  [CityPiece.Temple]: '⛩',
  [CityPiece.Market]: '🏪',
  [CityPiece.Obelisk]: '🗿',
  [CityPiece.Observatory]: '🔭',
};

const RESOURCE_ICONS: Record<Resource, string> = {
  [Resource.Food]: '🌾',
  [Resource.Wood]: '🪵',
  [Resource.Ore]: '⛏',
  [Resource.Gold]: '🪙',
  [Resource.Ideas]: '💡',
};

@Component({
  selector: 'app-ibo-scale',
  standalone: true,
  template: `
    <div class="scale-panel">
      <h3 class="panel-title">Scale</h3>
      <div class="scale-track">
        @for (slot of scale(); track slot.position) {
          <div class="scale-slot" [class.empty]="!slot.cityPiece" [class.exhausted]="slot.exhausted">
            <div class="slot-pos">{{ slot.position }}</div>
            @if (slot.cityPiece) {
              <div class="slot-piece" [title]="slot.cityPiece">
                {{ pieceIcon(slot.cityPiece) }}
                @if (slot.cityPiece === 'Settlement' && slot.resourceToken) {
                  <span class="slot-resource">{{ resourceIcon(slot.resourceToken) }}</span>
                }
              </div>
              <div class="slot-label">{{ slot.cityPiece }}</div>
            } @else {
              <div class="slot-piece empty-piece">—</div>
            }
          </div>
        }
      </div>
      <div class="scale-legend">
        <span>← Construct from left</span>
        <span>Add advancements → right</span>
      </div>
    </div>
  `,
  styles: [`
    .scale-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: .75rem; }
    .panel-title { font-size: .9rem; font-weight: 700; color: var(--text-muted); margin: 0 0 .75rem; text-transform: uppercase; letter-spacing: .05em; }
    .scale-track { display: flex; gap: .3rem; overflow-x: auto; padding-bottom: .25rem; }
    .scale-slot {
      min-width: 64px; flex: 0 0 64px;
      background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
      padding: .4rem .3rem; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: .2rem;
    }
    .scale-slot.exhausted { border-color: #c05050; background: rgba(200,50,50,.08); }
    .slot-pos { font-size: .65rem; color: var(--text-muted); font-weight: 600; }
    .slot-piece { font-size: 1.3rem; position: relative; }
    .slot-resource { font-size: .7rem; position: absolute; bottom: -2px; right: -4px; }
    .slot-label { font-size: .6rem; color: var(--text-muted); }
    .empty-piece { color: var(--border); }
    .scale-legend {
      display: flex; justify-content: space-between;
      font-size: .65rem; color: var(--text-muted); margin-top: .4rem;
    }
  `],
})
export class IboScaleComponent {
  scale = input.required<ScaleSlot[]>();

  pieceIcon(piece: CityPiece): string {
    return PIECE_ICONS[piece] ?? '?';
  }

  resourceIcon(resource: Resource): string {
    return RESOURCE_ICONS[resource] ?? '?';
  }
}
