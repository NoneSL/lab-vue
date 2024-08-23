import Stats from 'three/examples/jsm/libs/stats.module.js'
export class StatsManager {
  stats: Stats
  constructor() {
    this.stats = new Stats()
  }
}
