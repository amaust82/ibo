import { Component, input, ElementRef, AfterViewChecked, ViewChild } from '@angular/core';
import { TurnRecord, LogStep, CARD_ICON_EMOJI, CARD_ICON_LABEL } from '../../../../core/models/game.models';

@Component({
  selector: 'app-turn-log',
  standalone: true,
  template: `
    <div class="log-panel">
      <h3 class="panel-title">Turn History</h3>
      <div class="log-scroll" #scroll>
        @if (history().length === 0) {
          <div class="log-empty">No turns yet. Execute IBO's turn to see the log.</div>
        }
        @for (record of history(); track record.turn) {
          <div class="turn-block">
            <div class="turn-header">Turn {{ record.turn }} — Age {{ record.age }}</div>
            @for (step of record.steps; track $index) {
              <div class="log-step" [class.header-step]="step.text.startsWith('═')"
                   [class.section-step]="step.text.startsWith('──')">
                @if (step.cardIcon) {
                  <span class="log-card-chip">
                    {{ iconEmoji(step.cardIcon) }} {{ iconLabel(step.cardIcon) }}
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
        }
      </div>
    </div>
  `,
  styles: [`
    .log-panel {
      background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
      display: flex; flex-direction: column; height: 100%;
    }
    .panel-title {
      font-size: .9rem; font-weight: 700; color: var(--text-muted); margin: 0;
      padding: .75rem; border-bottom: 1px solid var(--border);
      text-transform: uppercase; letter-spacing: .05em;
    }
    .log-scroll { flex: 1; overflow-y: auto; padding: .5rem; }
    .log-empty { text-align: center; color: var(--text-muted); padding: 1.5rem; font-size: .85rem; }
    .turn-block { margin-bottom: 1rem; }
    .turn-header {
      font-size: .75rem; font-weight: 700; color: var(--accent);
      padding: .2rem .4rem; border-left: 3px solid var(--accent); margin-bottom: .25rem;
    }
    .log-step {
      display: flex; align-items: flex-start; gap: .4rem;
      padding: .15rem .4rem; font-size: .8rem; line-height: 1.4;
    }
    .header-step {
      font-weight: 700; color: var(--accent); font-size: .85rem;
      border-bottom: 1px solid var(--border); padding-bottom: .3rem; margin-bottom: .2rem;
    }
    .section-step { color: var(--text-muted); font-style: italic; }
    .dice-row { display: flex; gap: .2rem; flex-shrink: 0; }
    .die {
      width: 20px; height: 20px; border: 1.5px solid var(--accent); border-radius: 3px;
      display: flex; align-items: center; justify-content: center;
      font-size: .75rem; font-weight: 700; color: var(--accent); flex-shrink: 0;
    }
    .step-text { flex: 1; }
    .log-card-chip {
      font-size: .68rem; padding: .08rem .32rem; border-radius: 4px; flex-shrink: 0;
      background: rgba(240,192,64,.12); border: 1px solid rgba(240,192,64,.3); white-space: nowrap;
    }
  `],
})
export class TurnLogComponent implements AfterViewChecked {
  history = input.required<TurnRecord[]>();
  @ViewChild('scroll') private scrollRef!: ElementRef<HTMLDivElement>;

  private shouldScroll = false;

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollRef?.nativeElement?.scrollTo({ top: 99999, behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  scrollToBottom() {
    this.shouldScroll = true;
  }

  iconEmoji(icon: any): string { return CARD_ICON_EMOJI[icon as keyof typeof CARD_ICON_EMOJI] ?? '?'; }
  iconLabel(icon: any): string { return CARD_ICON_LABEL[icon as keyof typeof CARD_ICON_LABEL] ?? icon; }
}
