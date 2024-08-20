import * as three from 'three'
export class Scene {
  scene: three.Scene
  constructor(scene: three.Scene) {
    this.scene = scene
  }
  add(object: any) {
    this.scene.add(object)
  }
  delete(object: any) {
    this.scene.remove(object)
  }
}
