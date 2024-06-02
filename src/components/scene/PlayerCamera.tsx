import { createEffect, onCleanup, Component } from 'solid-js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useSceneContext } from './SceneContext'

const floatPolarAngle = false
const floatAzimuthAngle = false

let currentPolarAngle = 1
let currentAzimuthAngle = 0

const PlayerCamera: Component<{
    playerRef: THREE.Group | THREE.Mesh
}> = ({ playerRef }) => {
    const context = useSceneContext()
    if (!context) return

    const { scene, camera, renderer } = context
    const controls = new OrbitControls(camera, renderer.domElement)
    let targetDistance = 5
    let isUserInteracting = false

    // Default to no rotation
    controls.enableRotate = true

    // Limit controls to prevent panning
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Limit rotation range
    controls.minPolarAngle = 0.2
    controls.maxPolarAngle = 1
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
        renderer.domElement.style.cursor = 'grabbing'
    })

    controls.addEventListener('end', () => {
        isUserInteracting = false
        renderer.domElement.style.cursor = 'pointer'
        targetDistance = camera.position.distanceTo(playerRef.position)
    })

    const animate = () => {
        // Always update the controls target to follow the player
        controls.target.copy(playerRef.position)

        if (isUserInteracting) {
            controls.minPolarAngle = 0.2
            controls.maxPolarAngle = 1
            currentPolarAngle = controls.getPolarAngle()

            controls.minAzimuthAngle = -Infinity
            controls.maxAzimuthAngle = Infinity
            currentAzimuthAngle = controls.getAzimuthalAngle()

            // While user is interacting, maintain the distance
            const direction = new THREE.Vector3()
                .copy(camera.position)
                .sub(playerRef.position)
                .normalize()

            camera.position.copy(
                playerRef.position
                    .clone()
                    .addScaledVector(direction, targetDistance)
            )
        } else {
            if (!floatPolarAngle) {
                controls.minPolarAngle = currentPolarAngle
                controls.maxPolarAngle = currentPolarAngle
            }

            if (!floatAzimuthAngle) {
                controls.minAzimuthAngle = currentAzimuthAngle
                controls.maxAzimuthAngle = currentAzimuthAngle
            }

            // When not interacting, smoothly move the camera to the target position
            const direction = new THREE.Vector3()
                .copy(camera.position)
                .sub(playerRef.position)
                .normalize()

            let newCameraPosition = new THREE.Vector3()
                .copy(playerRef.position)
                .addScaledVector(direction, targetDistance)

            // Update the camera's position smoothly
            camera.position.lerp(newCameraPosition, 0.1)
        }

        controls.update()
        requestAnimationFrame(animate)
    }

    createEffect(() => {
        scene.add(camera)
        targetDistance = camera.position.distanceTo(playerRef.position)
        animate()

        onCleanup(() => {
            scene.remove(camera)
            controls.dispose()
        })
    })

    return null
}

export default PlayerCamera
