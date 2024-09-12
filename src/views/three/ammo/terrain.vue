<script setup lang="ts">
import Ammo from 'ammojs-typed'
// import Ammo from '/public/ammo/ammo.js'
import * as Three from 'three'
import { nextTick, onMounted, ref } from 'vue'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
defineOptions({
  name: 'terrainView'
})
// console.log(AmmoLib)
// onMounted(() => {
//     // console.log('mounted')
//     // init();

// })
// AmmoLib(AmmoLib).then(() => {
//     const v2 = new AmmoLib.btVector3(1, 2, 3) // <-- works
// })
// setTimeout(() => {
let AmmoApi: typeof Ammo
let physicsWorld: Ammo.btDiscreteDynamicsWorld
let cube: Three.Mesh
let transformAux1: Ammo.btTransform
let ctrl: OrbitControls

Ammo.bind(window)().then((api) => {
  AmmoApi = api
  init(api)
  ThreeInit()
})

// }, 2000);
const canvas = ref()
const ThreeInit = () => {
  const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const scene = new Three.Scene()
  scene.background = new Three.Color(0xeeeeee)
  const renderer = new Three.WebGLRenderer({ antialias: true })
  const elem = canvas.value
  renderer.render(scene, camera)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  elem.appendChild(renderer.domElement)
  ctrl = new OrbitControls(camera, renderer.domElement)
  const clock = new Three.Clock()

  camera.position.set(10, 10, 10)

  addMesh(scene, camera)
  light(scene)

  const render = () => {
    // console.log("rendering")
    renderer.render(scene, camera)
    physicsWorld.stepSimulation(10)
    const objPhys = cube.userData.physicsBody
    const ms = objPhys.getMotionState()
    if (ms) {
      ms.getWorldTransform(transformAux1)
      const p = transformAux1.getOrigin()
      const q = transformAux1.getRotation()
      cube.position.set(p.x(), p.y(), p.z())
      cube.quaternion.set(q.x(), q.y(), q.z(), q.w())
      ctrl.target.set(cube.position.x, cube.position.y, cube.position.z)
    }
    ctrl.update()

    renderer.setAnimationLoop(render)
  }
  render()
}
const addMesh = (scene: Three.Scene, camera: Three.Camera) => {
  cube = new Three.Mesh(
    new Three.BoxGeometry(1, 1, 1),
    new Three.MeshLambertMaterial({ color: 0x00ff00 })
  )
  cube.position.set(0, 10, 0)
  camera.lookAt(cube.position)
  scene.add(cube)

  const shape = new AmmoApi.btBoxShape(new AmmoApi.btVector3(0.5, 0.5, 0.5))
//   shape.setMargin(0.05)
  const mass = 3 * 5
  const localInertia = new AmmoApi.btVector3(0, 0, 0)
  shape.calculateLocalInertia(mass, localInertia)

  const transform = new AmmoApi.btTransform()
  transform.setIdentity()
  const pos = cube.position
  transform.setOrigin(new AmmoApi.btVector3(pos.x, pos.y, pos.z))
  const motionState = new AmmoApi.btDefaultMotionState(transform)
  const rbInfo = new AmmoApi.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
  const body = new AmmoApi.btRigidBody(rbInfo)
  physicsWorld.addRigidBody(body)
  cube.userData.physicsBody = body

  const groundMaterial = new Three.MeshPhongMaterial({ color: 0xc7c7c7 })
  const terrain = new Three.Mesh(new Three.PlaneGeometry(1000, 1000), groundMaterial)
  const loader = new Three.TextureLoader()

  loader.load('/public/texture/grid.png', (texture) => {
    texture.wrapS = Three.RepeatWrapping
    texture.wrapT = Three.RepeatWrapping
    texture.repeat.set(100, 100)
    groundMaterial.map = texture
    groundMaterial.needsUpdate = true
  })
  terrain.position.set(0, 0, 0)
  terrain.castShadow = true
  terrain.receiveShadow = true
  terrain.rotateX(-Math.PI / 2)
  scene.add(terrain)
}
const light = (scene: Three.Scene) => {
  const light = new Three.DirectionalLight(0xffffff, 1)
  light.position.set(10, 10, 10)
  // const dLight = 200;
  // const sLight = dLight * 0.25;
  // light.shadow.camera.left = - sLight;
  // light.shadow.camera.right = sLight;
  // light.shadow.camera.top = sLight;
  // light.shadow.camera.bottom = - sLight;

  // light.shadow.camera.near = dLight / 30;
  // light.shadow.camera.far = dLight;

  // light.shadow.mapSize.x = 1024 * 2;
  // light.shadow.mapSize.y = 1024 * 2;
  light.castShadow = true

  scene.add(light)
}

const init = (api: typeof Ammo) => {
  const collisionConfiguration = new api.btDefaultCollisionConfiguration()
  const dispatcher = new api.btCollisionDispatcher(collisionConfiguration)
  const broadphase = new api.btDbvtBroadphase()
  const solver = new api.btSequentialImpulseConstraintSolver()
  physicsWorld = new api.btDiscreteDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration
  )
  // console.log(physicsWorld)
  physicsWorld.setGravity(new api.btVector3(0, -10, 0))

  const heightFieldShape = new api.btStaticPlaneShape(new api.btVector3(0, 1, 0), 0)
  const groundShape = heightFieldShape
  const groundTransform = new api.btTransform()
  groundTransform.setIdentity()
  // Shifts the terrain, since bullet re-centers it on its bounding box.
  groundTransform.setOrigin(new api.btVector3(0, 0, 0))
  const groundMass = 0
  const groundLocalInertia = new api.btVector3(0, 0, 0)
  const groundMotionState = new api.btDefaultMotionState(groundTransform)
  const groundBody = new api.btRigidBody(
    new api.btRigidBodyConstructionInfo(
      groundMass,
      groundMotionState,
      groundShape,
      groundLocalInertia
    )
  )
  groundBody.setRestitution(1)
  physicsWorld.addRigidBody(groundBody)
  transformAux1 = new api.btTransform()
}
</script>

<template>
  <div ref="canvas"></div>
</template>

<style lang="scss" scoped></style>
