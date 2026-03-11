import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Game } from '../models/game.models';

class AppDB extends Dexie {
  games!: Table<Game, number>;

  constructor() {
    super('IboAppDB');
    this.version(1).stores({
      games: '++id, name, updatedAt',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class DbService {
  private db = new AppDB();

  async listGames(): Promise<Game[]> {
    return this.db.games.orderBy('updatedAt').reverse().toArray();
  }

  async loadGame(id: number): Promise<Game | undefined> {
    return this.db.games.get(id);
  }

  async saveGame(game: Game): Promise<number> {
    game.updatedAt = new Date().toISOString();
    if (game.id !== undefined) {
      await this.db.games.put(game);
      return game.id;
    }
    return this.db.games.add(game);
  }

  async deleteGame(id: number): Promise<void> {
    await this.db.games.delete(id);
  }
}
