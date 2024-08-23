<script setup lang='ts'>
// import Ammo from 'ammojs-typed'
import Ammo from 'ammojs-typed'
import * as Three from "three"
import { nextTick, onMounted, ref } from 'vue';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
// SMAA抗锯齿通道
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
// ShaderPass功能：使用后处理Shader创建后处理通道
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// import Stats from 'three/addons/libs/stats.module.js';
import Stats from "three/examples/jsm/libs/stats.module.js"
defineOptions({
    name: 'terrain'
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
let AmmoApi: typeof Ammo;
let physicsWorld: Ammo.btDiscreteDynamicsWorld;
let cube: Three.Mesh;
let transformAux1: Ammo.btTransform;
let ctrl: OrbitControls;
let camera: Three.Camera;
let light: Three.DirectionalLight;
let scene: Three.Scene;
let physicsList: Three.Mesh[] = [];
let stats = new Stats();
let renderer: Three.WebGLRenderer;
let composer: EffectComposer;
let obj3d66: Three.Mesh;
let bloompass: UnrealBloomPass
Ammo.bind(window)().then(api => {
    console.log("ammo init ready")
    AmmoApi = api;
    init(api);
    ThreeInit();
    statsInit();
    // setInterval(() => {
    //     addMesh();
    // }, 1);
    // setInterval(() => {
    //     addMesh();
    // }, 1);
    //   const v2 = new Ammo.btVector3(1, 2, 3) // <-- runtime error here
})

// }, 2000);
const canvas = ref();
//控制方块移动。
const keys = {
    'w': false,
    's': false,
    'a': false,
    'd': false,
}
const moveCtrl = () => {
    //控制状态。render中移动，

    window.addEventListener('keydown', keydownHandler)
    window.addEventListener('keyup', keyupHandler)
    //解除状态。
    function keyupHandler(e: KeyboardEvent) {
        const key = e.key as keyof typeof keys
        if (keys[key]) {
            keys[key] = false;
        }
    }
    //一次只能往一个方向移动
    function keydownHandler(e: KeyboardEvent) {
        if (Object.values(keys).filter(item => item).length > 1) {
            return;
        }
        const key = e.key as keyof typeof keys;
        keys[key] = true;
    }

}
moveCtrl();
const moveCtrlHandle = () => {
    if (keys.w) {
        cube.position.y += 0.1;
    }
    if (keys.s) {
        cube.position.y -= 0.1;
    }
    if (keys.a) {
        cube.position.x -= 0.1;
    }
    if (keys.d) {
        cube.position.x += 0.1;
    }
}
const statsInit = () => {
    const elem = canvas.value;

    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0px';
    console.log(stats.dom)
    elem.appendChild(stats.dom);
}
const addObstacles = () => {
    const boxGeometry = new Three.BoxGeometry(10, 10, 2);
    const boxMaterial = new Three.MeshStandardMaterial({ color: 0xff0000 });
    const Mesh = new Three.Mesh(boxGeometry, boxMaterial);
    scene.add(Mesh);
    const transform = new AmmoApi.btTransform();
    transform.setIdentity();
    const pos = Mesh.position;
    transform.setOrigin(new AmmoApi.btVector3(pos.x, pos.y, pos.z));
    const motionState = new AmmoApi.btDefaultMotionState(transform);


    const physisc = new AmmoApi.btRigidBody(
        new AmmoApi.btRigidBodyConstructionInfo(
            1,
            motionState,
            new AmmoApi.btBoxShape(new AmmoApi.btVector3(5, 5, 1)),
            new AmmoApi.btVector3(0, 0, 0)
        )
    );
    physicsWorld.addRigidBody(physisc);
}
const loadModel = () => {
    // const loader = new FBXLoader();
    // loader.load('/public/model/three-axis-robot-bak.FBX', (model) => {
    //     console.log(model)

    //     scene.add(model)
    //     ctrl.target.set(model.position.x, model.position.y, model.position.z)
    // })
    const loader = new GLTFLoader();
    loader.load("/public/model/three-axis-robot.glb", (model) => {
        model.scene.traverse((child) => {
            const item = child as Three.Mesh;
            const name = child.name;

            if (name == 'Obj3d66-18592180-15-178') {
                console.log(child)


                obj3d66 = item;
                if (obj3d66)
                    obj3d66.material = new Three.MeshPhongMaterial({
                        emissive: 0xff937a,
                        emissiveIntensity: 50,
                        color: 0xffffff,
                        specular: 0xffffff,
                        shininess: 1000,
                        side: Three.DoubleSide,
                        transparent: true,
                    })
                //添加闪烁动画
                // item.material = new Three.Mater({
                //     color: 0xff0000
                // })
                // child.material.color.setHex(0xff0000)
            }
            if (item.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        })
        model.scene.scale.set(2, 2, 2)
        model.scene.position.set(15, 0, 5)
        scene.add(model.scene)


    })
    // const compoer=new EffectComposer(renderer);
    const renderpass = new RenderPass(scene, camera);
    const bloompass = new UnrealBloomPass(new Three.Vector2(window.innerWidth, window.innerHeight), 0.2, 0.01, 1);

    composer = new EffectComposer(renderer);
    composer.addPass(renderpass);
    composer.addPass(bloompass);
    composer.setPixelRatio(window.devicePixelRatio)
    const pixelRatio = renderer.getPixelRatio(), width = window.innerWidth, height = window.innerHeight;
    const smaaPass = new SMAAPass(width * pixelRatio, height * pixelRatio);
    composer.addPass(smaaPass);
    //设置材质颜色,红色 发光材质

}
const ThreeInit = () => {
    camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene = new Three.Scene();
    scene.background = new Three.Color(0xeeeeee);
    renderer = new Three.WebGLRenderer({ antialias: true });
    const elem = canvas.value;
    renderer.render(scene, camera);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    elem.appendChild(renderer.domElement);
    ctrl = new OrbitControls(camera, renderer.domElement);
    const clock = new Three.Clock();

    camera.position.set(10, 10, 10);

    addMesh();
    // addObstacles();
    addLight(scene);
    createPlan();
    loadModel();
    const render = () => {
        // console.log("rendering")
        // renderer.render(scene, camera);
        light.shadow.camera.updateProjectionMatrix();
        physicsWorld.stepSimulation(clock.getDelta())
        // const objPhys = cube.userData.physicsBody;
        physicsList.forEach(item => {
            const objPhys = item.userData.physicsBody;
            // objPhys.setLinearVelocity(new AmmoApi.btVector3(0, 10, 1))

            // const transform1 = new AmmoApi.btTransform(new AmmoApi.btQuaternion(0, 0, 0, 1), new AmmoApi.btVector3(1, 10, 1));
            // const btMotionState = new AmmoApi.btDefaultMotionState();
            // btMotionState.setWorldTransform(transform1)
            // objPhys.setMotionState(btMotionState)

            // objPhys.setInvInertiaDiagLocal(new AmmoApi.btVector3(0, 1, 0))
            // const transform = new AmmoApi.btTransform();
            // transform.setIdentity();
            // const pos = cube.position;
            // transform.setOrigin(new AmmoApi.btVector3(pos.x, pos.y, pos.z));
            // const motionState = new AmmoApi.btDefaultMotionState(transform);
            // objPhys.setMotionState(motionState)
            const ms = objPhys.getMotionState();
            if (ms) {

                ms.getWorldTransform(transformAux1);
                const p = transformAux1.getOrigin();
                const q = transformAux1.getRotation();
                item.position.set(p.x(), p.y(), p.z());
                item.quaternion.set(q.x(), q.y(), q.z(), q.w());
                // ctrl.target.set(item.position.x, item.position.y, item.position.z)

            }
            //移动控制。
            //地板上的。
            if (keys.w) {
                // objPhys.set
                objPhys.applyCentralImpulse(new AmmoApi.btVector3(10, 0, 0))
            }
            if (keys.s) {
                objPhys.applyCentralImpulse(new AmmoApi.btVector3(-10, 20, 0))

            }
            if (keys.a) {
                objPhys.applyCentralImpulse(new AmmoApi.btVector3(0, 0, 10))

            }
            if (keys.d) {
                objPhys.applyCentralImpulse(new AmmoApi.btVector3(0, 0, -10))

            }

        })
        stats.update();
        composer.render();
        ctrl.update();
        const time = clock.getElapsedTime();
        if (obj3d66) {
            (obj3d66.material as any).emissive.set(0xff937a).multiplyScalar(Math.sin(time * 2) * 4 + 5);
            // bloompass.strength = Math.sin(time * 2) * 1 + 3.3;
        }
        // const pos = cube.position;
        // const transform1 = new AmmoApi.btTransform(new AmmoApi.btQuaternion(0, 0, 0, 0), new AmmoApi.btVector3(pos.x, pos.y, pos.z));
        // const btMotionState = new AmmoApi.btDefaultMotionState();
        // transformAux12.setRotation(new AmmoApi.btQuaternion(new AmmoApi.btVector3(0, 0, 0), 0));
        // btMotionState.setWorldTransform(transform1)
        // cube.userData.physicsBody.setMotionState(btMotionState);
        // console.log("text")
        renderer.setAnimationLoop(render);

    }
    render();
}
const addMesh = () => {
    cube = new Three.Mesh(new Three.BoxGeometry(1, 1, 1), new Three.MeshLambertMaterial({ color: 0x00ff00 }));
    cube.position.set(0, 100, 0);
    // camera.lookAt(cube.position);
    scene.add(cube);

    const shape = new AmmoApi.btBoxShape(new AmmoApi.btVector3(1, 1, 1));
    shape.setMargin(0.05);
    const mass = 3 * 5;
    const localInertia = new AmmoApi.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, localInertia);

    const transform = new AmmoApi.btTransform();
    transform.setIdentity();
    const pos = cube.position;
    transform.setOrigin(new AmmoApi.btVector3(pos.x, pos.y, pos.z));
    const motionState = new AmmoApi.btDefaultMotionState(transform);
    const rbInfo = new AmmoApi.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const body = new AmmoApi.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(body);
    cube.userData.physicsBody = body;


    physicsList.push(cube)

}
const addLight = (scene: Three.Scene) => {
    light = new Three.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    light.shadow.mapSize.width = 1024; // Default: 512
    light.shadow.mapSize.height = 1024; // Default: 512
    light.shadow.camera.near = 0.5; // Default: 0.5
    light.shadow.camera.far = 500; // Default: 500
    light.shadow.bias = -0.005;

    light.shadow.camera.left = -50;
    light.shadow.camera.right = 50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
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
    light.castShadow = true;

    scene.add(light);
    // light
    scene.add(new Three.HemisphereLight(0xffffff, 0x000000, 1))
    scene.add(new Three.AmbientLight(0xffffff, 1))
}
const createPlan = () => {
    const heightFieldShape = new AmmoApi.btStaticPlaneShape(new AmmoApi.btVector3(0, 1, 0), 0);
    const groundShape = heightFieldShape;
    const groundTransform = new AmmoApi.btTransform();
    groundTransform.setIdentity();
    // Shifts the terrain, since bullet re-centers it on its bounding box.
    groundTransform.setOrigin(new AmmoApi.btVector3(0, 0, 0));
    const groundMass = 0;
    const groundLocalInertia = new AmmoApi.btVector3(0, 0, 0);
    const groundMotionState = new AmmoApi.btDefaultMotionState(groundTransform);
    const groundBody = new AmmoApi.btRigidBody(new AmmoApi.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia));
    groundBody.setFriction(1);
    physicsWorld.addRigidBody(groundBody);
    transformAux1 = new AmmoApi.btTransform();

    const groundMaterial = new Three.MeshBasicMaterial({ color: 0x6e6e6e });
    const terrain = new Three.Mesh(new Three.PlaneGeometry(1000, 1000), groundMaterial);
    const loader = new Three.TextureLoader();

    loader.load("/public/texture/grid.png", texture => {
        texture.wrapS = Three.RepeatWrapping;
        texture.wrapT = Three.RepeatWrapping;
        texture.repeat.set(100, 100);
        groundMaterial.map = texture;
        groundMaterial.needsUpdate = true;
    })
    terrain.position.set(0, 0, 0);
    // terrain.castShadow = true;
    terrain.receiveShadow = true;
    terrain.rotateX(-Math.PI / 2)
    scene.add(terrain);
}

const init = (api: typeof Ammo) => {
    const collisionConfiguration = new api.btDefaultCollisionConfiguration();
    const dispatcher = new api.btCollisionDispatcher(collisionConfiguration);
    const broadphase = new api.btDbvtBroadphase();
    const solver = new api.btSequentialImpulseConstraintSolver();
    physicsWorld = new api.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    // console.log(physicsWorld)
    physicsWorld.setGravity(new api.btVector3(0, - 60, 0));
}
</script>

<template>
    <div ref="canvas"></div>
    <!-- <div class="configure"> -->
    <!-- <div style="opacity: 1;">
            FUCKYOU
        </div> -->
    <!-- </div> -->

</template>

<style lang='scss' scoped>
.configure {
    // display: flex;
    position: absolute;
    // border: 1px solid red;
    width: 500px;
    height: 500px;
    z-index: 111;
    top: 0px;
    right: 0px;
    background-color: white;
    // opacity: 0.3;
    //毛玻璃
    backdrop-filter: blur(10px);
    //透明效果
    opacity: 0.3;

    // border-radius: 10px;
}
</style>
