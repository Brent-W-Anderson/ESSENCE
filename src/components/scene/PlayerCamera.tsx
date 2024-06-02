import { createEffect, onCleanup, Component } from 'solid-js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useSceneContext } from './SceneContext'

type PlayerCameraProps = {
    playerRef: THREE.Group | THREE.Mesh
}

const PlayerCamera: Component<PlayerCameraProps> = ({ playerRef }) => {
    const context = useSceneContext()
    if (!context) return

    const { scene, camera, renderer } = context
    const controls = new OrbitControls(camera, renderer.domElement)
    let targetDistance = 5
    let initialDirection = new THREE.Vector3(0, 0, 1) // Initial direction vector
    let isUserInteracting = false

    // Default to no rotation
    controls.enableRotate = true

    // Limit controls to prevent panning
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Limit rotation range
    controls.minPolarAngle = 0.2
    controls.maxPolarAngle = Math.PI / 3
    controls.rotateSpeed = 0.5

    // Set zoom distance limits
    controls.minDistance = 5
    controls.maxDistance = 20
    controls.zoomSpeed = 3

    controls.target.copy(playerRef.position)
    controls.mouseButtons = {
        LEFT: null,
        RIGHT: THREE.MOUSE.ROTATE
    }
    controls.update()

    // Track user interaction
    controls.addEventListener('start', () => {
        isUserInteracting = true
    })

    controls.addEventListener('end', () => {
        isUserInteracting = false
        targetDistance = camera.position.distanceTo(controls.target)
        // Update the initial direction when user releases the right-click
        initialDirection
            .copy(camera.position)
            .sub(playerRef.position)
            .normalize()
    })

    const animate = () => {
        // Always update the controls target to follow the player
        controls.target.copy(playerRef.position)

        if (!isUserInteracting) {
            // Calculate the new camera position based on the initial direction and target distance
            const newCameraPosition = new THREE.Vector3()
                .copy(playerRef.position)
                .addScaledVector(initialDirection, targetDistance)

            // Update the camera's position
            camera.position.lerp(newCameraPosition, 1)
        }

        controls.update()
        requestAnimationFrame(animate)
    }

    createEffect(() => {
        scene.add(camera)
        animate()

        onCleanup(() => {
            scene.remove(camera)
            controls.dispose()
        })
    })

    return null
}

export default PlayerCamera
