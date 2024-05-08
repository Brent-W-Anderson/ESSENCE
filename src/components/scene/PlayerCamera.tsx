import { createEffect, Component } from 'solid-js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useSceneContext } from './SceneContext'

type PlayerCameraProps = {
    target: THREE.Object3D
}

const PlayerCamera: Component<PlayerCameraProps> = ({ target }) => {
    const context = useSceneContext()
    if (!context) return

    const { scene, camera, renderer } = context
    const controls = new OrbitControls(camera, renderer.domElement)

    // Default to no rotation
    controls.enableRotate = true

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
    controls.mouseButtons = {
        LEFT: null,
        RIGHT: THREE.MOUSE.ROTATE
    }
    controls.update()

    const animate = () => {
        controls.target.copy(target.position)
        controls.update()
        requestAnimationFrame(animate)
    }

    createEffect(() => {
        scene.add(camera)
        animate()

        return () => {
            scene.remove(camera)
            controls.dispose()
        }
    })

    return null
}

export default PlayerCamera
