import { createEffect, Component } from 'solid-js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

type PlayerCameraProps = {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    target: THREE.Object3D
}

const PlayerCamera: Component<PlayerCameraProps> = ({ scene, camera, renderer, target }) => {
    const controls = new OrbitControls(camera, renderer.domElement)

    // Default to no rotation
    controls.enableRotate = false

    // Limit controls to prevent panning
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Limit rotation range
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI / 3

    // Set zoom distance limits
    controls.minDistance = 3
    controls.maxDistance = 10
    controls.rotateSpeed = 0.5
    controls.target.copy(target.position)
    controls.update()

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Control') {
            controls.enableRotate = true
        }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
        if (event.key === 'Control') {
            controls.enableRotate = false
        }
    }

    const animate = () => {
        controls.target.copy(target.position)
        controls.update()
        requestAnimationFrame(animate)
    }

    createEffect(() => {
        scene.add(camera)
        animate()
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            scene.remove(camera)
            controls.dispose()
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    })

    return null
}


export default PlayerCamera
