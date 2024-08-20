import { Scene } from 'three'
import * as Three from 'three'
export class Light {
  scene
  constructor(scene: Scene) {
    this.scene = scene
    this.init()
  }
  init() {
    const ambientLight = new Three.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)
    const directionalLight = new Three.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(0, 0, 1)
    this.scene.add(directionalLight)
  }
}
