import * as three from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { Light } from './light'
export class core {
  scene: three.Scene
  camera: three.PerspectiveCamera
  renderer: three.WebGLRenderer
  controls: OrbitControls
  constructor(element: HTMLElement) {
    console.log('THREE initial success!')
    this.scene = new three.Scene()
    const { clientWidth, clientHeight } = element
    console.log(clientWidth, clientHeight)
    this.camera = new three.PerspectiveCamera(
      75,
      element.clientWidth / element.clientHeight,
      0.1,
      1000
    )
    this.renderer = new three.WebGLRenderer({
      antialias: true
    })
    this.renderer.setSize(element.clientWidth, element.clientHeight)
    document.body.appendChild(this.renderer.domElement)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    element.appendChild(this.renderer.domElement)
    this.init()
    this.scene.add(this.mesh())
    this.render()
  }
  light() {
    const light = new Light(this.scene)
  }
  init() {
    this.camera.position.z = 5
    this.light()
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
  mesh() {
    return new three.Mesh(
      new three.BoxGeometry(1, 1, 1),
      new three.MeshPhongMaterial({ color: 0x00ff00 })
    )
  }
  render() {
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera)
    })
  }
}
