import type { Territory, PowerUp, PowerUpType } from '../types';

export class PowerUpManager {
  private static readonly POWER_UPS: PowerUp[] = [
    {
      type: 'doubleAttack',
      name: 'Double Attack',
      description: 'Attack twice in one turn',
      icon: '⚔️'
    },
    {
      type: 'ironDefense',
      name: 'Iron Defense',
      description: '+2 dice when defending',
      icon: '🛡️'
    },
    {
      type: 'teleport',
      name: 'Teleport',
      description: 'Move dice between territories',
      icon: '✨'
    }
  ];

  private static readonly SPAWN_CHANCE = 0.15; // 15% chance per turn
  private static readonly MAX_POWER_UPS = 3; // Maximum power-ups on map

  static spawnPowerUps(territories: Map<string, Territory>, turn: number): void {
    // Only spawn after turn 5
    if (turn < 5) return;

    // Count existing power-ups
    let currentPowerUps = 0;
    territories.forEach(territory => {
      if (territory.powerUp) currentPowerUps++;
    });

    // Don't spawn if max reached
    if (currentPowerUps >= this.MAX_POWER_UPS) return;

    // Random chance to spawn
    if (Math.random() > this.SPAWN_CHANCE) return;

    // Find empty territories (no power-up)
    const emptyTerritories: Territory[] = [];
    territories.forEach(territory => {
      if (!territory.powerUp && territory.ownerId) {
        emptyTerritories.push(territory);
      }
    });

    if (emptyTerritories.length === 0) return;

    // Select random territory
    const randomTerritory = emptyTerritories[
      Math.floor(Math.random() * emptyTerritories.length)
    ];

    // Select random power-up
    const randomPowerUp = this.POWER_UPS[
      Math.floor(Math.random() * this.POWER_UPS.length)
    ];

    // Assign power-up
    randomTerritory.powerUp = { ...randomPowerUp };

    console.log(`Power-up spawned: ${randomPowerUp.name} at ${randomTerritory.id}`);
  }

  static collectPowerUp(territory: Territory): PowerUp | null {
    if (!territory.powerUp) return null;

    const powerUp = territory.powerUp;
    territory.powerUp = null;
    
    console.log(`Power-up collected: ${powerUp.name}`);
    return powerUp;
  }

  static applyDoubleAttack(playerId: string, effects: any): void {
    if (!effects[playerId]) {
      effects[playerId] = {};
    }
    effects[playerId].doubleAttack = true;
  }

  static applyIronDefense(playerId: string, effects: any): void {
    if (!effects[playerId]) {
      effects[playerId] = {};
    }
    effects[playerId].ironDefense = 2; // +2 dice bonus
  }

  static applyTeleport(playerId: string, effects: any): void {
    if (!effects[playerId]) {
      effects[playerId] = {};
    }
    effects[playerId].teleportReady = true;
  }

  static consumeDoubleAttack(playerId: string, effects: any): void {
    if (effects[playerId]?.doubleAttack) {
      effects[playerId].doubleAttack = false;
    }
  }

  static getDefenseBonus(playerId: string, effects: any): number {
    return effects[playerId]?.ironDefense || 0;
  }

  static clearTurnEffects(playerId: string, effects: any): void {
    if (effects[playerId]) {
      // Clear single-use effects
      effects[playerId].ironDefense = 0;
      effects[playerId].teleportReady = false;
    }
  }
}