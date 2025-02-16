import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'
import GUI from 'lil-gui'
import {Color} from "three";

/**
 * Debug UI
 */
const gui = new GUI({width: 300, title: 'Text & Scene Controls'})
window.addEventListener('keydown', (event) => {
    if (event.key === 'h') gui.show(gui._hidden)
})
gui.close()

const debugObject = {}

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl')

/**
 * Scene
 */
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTextures = [
    textureLoader.load('../static/textures/matcaps/1.png'),
    textureLoader.load('../static/textures/matcaps/2.png'),
    textureLoader.load('../static/textures/matcaps/3.png'),
    textureLoader.load('../static/textures/matcaps/4.png'),
    textureLoader.load('../static/textures/matcaps/5.png'),
    textureLoader.load('../static/textures/matcaps/6.png'),
    textureLoader.load('../static/textures/matcaps/7.png'),
    textureLoader.load('../static/textures/matcaps/8.png')
]

let matcapTexture = matcapTextures[2] // Default texture
matcapTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Fonts & Text
 */
const fontLoader = new FontLoader()
let text, textMaterial, textGeometry

const createText = () => {
    if (text) scene.remove(text) // Remove previous text

    let screenFactor = Math.min(window.innerWidth, window.innerHeight) * 0.0006

    textGeometry = new TextGeometry(debugObject.textContent, {
        font: debugObject.font,
        size: screenFactor * debugObject.baseSize,
        depth: debugObject.depth,
        curveSegments: 5,
        bevelEnabled: debugObject.bevelEnabled,
        bevelThickness: debugObject.bevelThickness,
        bevelSize: debugObject.bevelSize,
        bevelOffset: 0,
        bevelSegments: 3
    })
    textGeometry.center()

    textMaterial = new THREE.MeshMatcapMaterial({matcap: matcapTexture})
    text = new THREE.Mesh(textGeometry, textMaterial)
    scene.add(text)
}

fontLoader.load('../static/fonts/helvetiker_regular.typeface.json', (font) => {
    debugObject.font = font
    debugObject.textContent = '<Creative Design/>'
    debugObject.baseSize = 1.5
    debugObject.depth = 0.15
    debugObject.bevelEnabled = true
    debugObject.bevelThickness = 0.02
    debugObject.bevelSize = 0.015

    createText()

    // GUI Controls (Wireframe option removed)
    gui.add(debugObject, 'textContent').name('Text').onFinishChange(createText)
    gui.add(debugObject, 'baseSize', 1, 10, 0.5).onChange(createText)
    gui.add(debugObject, 'depth', 0.05, 0.5, 0.05).onChange(createText)
    gui.add(debugObject, 'bevelEnabled').onChange(createText)
    gui.add(debugObject, 'bevelThickness', 0.005, 0.05, 0.005).onChange(createText)
    gui.add(debugObject, 'bevelSize', 0.005, 0.05, 0.005).onChange(createText)

    gui.add({
        changeMatcap: () => {
            matcapTexture = matcapTextures[Math.floor(Math.random() * matcapTextures.length)]
            textMaterial.matcap = matcapTexture
            textMaterial.needsUpdate = true
        }
    }, 'changeMatcap').name('Random Matcap')
})

/**
 * Different Figures
 */
const figures = []
const geometries = [
    new THREE.TorusGeometry(0.5, 0.25, 20, 45), // Donut
    new THREE.SphereGeometry(1, 64, 64), // Sphere
    new THREE.BoxGeometry(1.6, 1.6, 1.6, 6, 6, 6), // Cube
    new THREE.ConeGeometry(0.9, 2.4, 32) // Pyramid
]

// Figures always have wireframe mode enabled
for (let i = 0; i < 50; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)]
    const shapeMaterial = new THREE.MeshPhysicalMaterial()
    shapeMaterial.metalness = 0
    shapeMaterial.roughness = 0
    const shape = new THREE.Mesh(geometry, shapeMaterial)

    shapeMaterial.wireframe = true
    shapeMaterial.color = new Color('silver')

    shape.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)
    shape.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
    const scale = Math.random() * 0.7 + 0.3
    shape.scale.set(scale, scale, scale)

    scene.add(shape)
    figures.push(shape)
}

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 300)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {width: window.innerWidth, height: window.innerHeight}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    createText()
})

/**
 * Fullscreen Toggle
 */
window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if (!fullscreenElement) {
        if (canvas.requestFullscreen) canvas.requestFullscreen()
        else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen()
    } else {
        if (document.exitFullscreen) document.exitFullscreen()
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    }
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2.5, 1, 10)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({canvas: canvas})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animation Loop
 */
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Shapes Animation
    figures.forEach((figure, index) => {
        figure.rotation.y += 0.01
        figure.rotation.x += 0.005
        figure.position.y += Math.sin(elapsedTime + index * 0.2) * 0.005
    })

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()