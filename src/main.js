import * as THREE from 'three'
import {gsap} from "gsap";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import GUI from "lil-gui";

const gui = new GUI({
    width: 300,
    title: 'Nice debug UI',
    closeFolders: false,
})

// gui.hide()

window.addEventListener('keydown', (event) => {
    if(event.key === 'h')
        gui.show(gui._hidden)
})

const debugObject = {}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//Resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    //Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//Fullscreen
window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
})

// Cursor
const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = -(event.clientY / sizes.height - 0.5)
})

// Scene
const scene = new THREE.Scene()

// Object
// const mesh = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
//     new THREE.MeshBasicMaterial({
//         color: 0xff0000,
//         wireframe: true
//     })
// )
// scene.add(mesh)

debugObject.color = '#3a6ea6'

const geometry = new THREE.BufferGeometry()
const count = 50
const positionsArray = new Float32Array(count * 3 * 3)
for (let i = 0; i < count * 3 * 3; i++) {
    positionsArray[i] = (Math.random() - 0.5) * 4
}
const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)
geometry.setAttribute('position', positionsAttribute)

const material = new THREE.MeshBasicMaterial({color: debugObject.color, wireframe: true})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const cubeTweaks = gui.addFolder('Awesome cube')
// cubeTweaks.close()

cubeTweaks
    .add(mesh.position, 'y')
    .max(3)
    .min(-3)
    .step(0.01)
    .name('elevation')

cubeTweaks
    .add(mesh, 'visible')

cubeTweaks
    .add(material, 'wireframe')

cubeTweaks
    .addColor(debugObject, 'color')
    .onChange(() => {
        material.color.set(debugObject.color)
    })

debugObject.spin = () => {
    gsap.to(mesh.rotation, {duration: 1, y: mesh.rotation.y + Math.PI * 2})
}
cubeTweaks
    .add(debugObject, 'spin')

debugObject.subdivision = 2
cubeTweaks
    .add(debugObject, 'subdivision')
    .min(1)
    .max(20)
    .step(1)
    .onFinishChange(() => {
        mesh.geometry.dispose()
        mesh.geometry = new THREE.BoxGeometry(
            1,1,1,
            debugObject.subdivision, debugObject.subdivision, debugObject.subdivision
        )
    })


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// const aspectRatio = sizes.width / sizes.height
// const camera = new THREE.OrthographicCamera(- 1 * aspectRatio, 1 * aspectRatio, 1, - 1, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()