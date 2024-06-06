import { createEffect, onCleanup, Component } from 'solid-js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useSceneContext } from '../../../_Scene/SceneContext'

const floatPolarAngle = false
const floatAzimuthAngle = false
const cameraFloatEasing = 1

let currentPolarAngle = 1
let currentAzimuthAngle = 0

const keysPressed: { [key: string]: { pressed: boolean; speed: number } } = {
    ArrowUp: { pressed: false, speed: 0.01 },
    ArrowLeft: { pressed: false, speed: 0.02 },
    ArrowDown: { pressed: false, speed: 0.01 },
    ArrowRight: { pressed: false, speed: 0.02 }
}

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
    })

    controls.addEventListener('end', () => {
        isUserInteracting = false
        targetDistance = camera.position.distanceTo(playerRef.position)
    })

    const handleKeyDown = (event: KeyboardEvent) => {
        const key = event.key
        if (key in keysPressed) {
            keysPressed[key].pressed = true
        }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
        const key = event.key
        if (key in keysPressed) {
            keysPressed[key].pressed = false
        }
    }

    const updateCameraAngles = () => {
        if (keysPressed.ArrowUp.pressed) {
            currentPolarAngle = Math.max(
                0.2,
                currentPolarAngle - keysPressed.ArrowUp.speed
            )
        }
        if (keysPressed.ArrowDown.pressed) {
            currentPolarAngle = Math.min(
                1,
                currentPolarAngle + keysPressed.ArrowDown.speed
            )
        }
        if (keysPressed.ArrowLeft.pressed) {
            currentAzimuthAngle += keysPressed.ArrowLeft.speed
        }
        if (keysPressed.ArrowRight.pressed) {
            currentAzimuthAngle -= keysPressed.ArrowRight.speed
        }
        controls.minPolarAngle = currentPolarAngle
        controls.maxPolarAngle = currentPolarAngle
        controls.minAzimuthAngle = currentAzimuthAngle
        controls.maxAzimuthAngle = currentAzimuthAngle
        controls.update()
    }

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
            updateCameraAngles()

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
            camera.position.lerp(newCameraPosition, cameraFloatEasing)
        }

        controls.update()
        requestAnimationFrame(animate)
    }

    createEffect(() => {
        scene.add(camera)
        targetDistance = camera.position.distanceTo(playerRef.position)
        animate()

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        onCleanup(() => {
            scene.remove(camera)
            controls.dispose()
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        })
    })

    return null
}

export default PlayerCamera
