import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DiceService {
  /** Roll a single d6, returning 1–6 */
  d6(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  /** Roll n d6 dice, returning array of results */
  roll(n: number): number[] {
    return Array.from({ length: n }, () => this.d6());
  }

  /**
   * Roll 3 dice for the ADVANCE action.
   * Returns [highest, middle, lowest] sorted descending.
   */
  rollAdvance(): [number, number, number] {
    const dice = this.roll(3).sort((a, b) => b - a);
    return [dice[0], dice[1], dice[2]];
  }

  /**
   * Convert a d6 value to a d3 result (1,2→1 | 3,4→2 | 5,6→3)
   */
  toD3(value: number): number {
    if (value <= 2) return 1;
    if (value <= 4) return 2;
    return 3;
  }

  /**
   * Convert a d6 value to a d2 result (1,2,3→1 | 4,5,6→2)
   */
  toD2(value: number): number {
    return value <= 3 ? 1 : 2;
  }

  /**
   * Pick randomly among n options (1-indexed).
   * Uses d6 mapped to the range.
   */
  pickOne(count: number): number {
    if (count <= 0) return 1;
    return Math.floor(Math.random() * count) + 1;
  }
}
