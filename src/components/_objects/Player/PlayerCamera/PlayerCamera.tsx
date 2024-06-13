import { createEffect, onCleanup, Component } from 'solid-js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useSceneContext } from '../../../_Scene/SceneContext'

const floatPolarAngle = false
const floatAzimuthAngle = false
const cameraFloatEasing = 0.1

let currentPolarAngle = 1
let currentAzimuthAngle = 0

const arrowKeyRotationSensitivity = 0.02
const mouseRotationSensitivity = 0.003

const keysPressed: { [key: string]: { pressed: boolean; speed: number } } = {
    ArrowUp: { pressed: false, speed: 0.01 },
    ArrowLeft: { pressed: false, speed: arrowKeyRotationSensitivity },
    ArrowDown: { pressed: false, speed: 0.01 },
    ArrowRight: { pressed: false, speed: arrowKeyRotationSensitivity }
}

const PlayerCamera: Component = () => {
    const context = useSceneContext()
    if (!context) return null

    const { playerRef } = context
    const player = playerRef?.() as THREE.Object3D

    if (!player) return null

    const { scene, camera, renderer } = context
    const controls = new OrbitControls(camera, renderer.domElement)
    let targetDistance = 5
    let isUserInteracting = false
    let mouseDown = false
    let startX = 0
    let startY = 0
    let initialDistance = 0

    // Default to no rotation
    controls.enableRotate = false // Disable internal OrbitControls rotation

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

    controls.target.copy(player.position)
    controls.mouseButtons = {
        LEFT: null,
        RIGHT: THREE.MOUSE.ROTATE
    }
    controls.update()

    const handleMouseDown = (event: MouseEvent) => {
        if (event.button === 2) {
            // Right-click
            mouseDown = true
            startX = event.clientX
            startY = event.clientY
            isUserInteracting = true
            initialDistance = camera.position.distanceTo(player.position)
        }
    }

    const handleMouseUp = (event: MouseEvent) => {
        if (event.button === 2) {
            // Right-click
            mouseDown = false
            isUserInteracting = false
            targetDistance = camera.position.distanceTo(player.position)
        }
    }

    const handleMouseMove = (event: MouseEvent) => {
        if (mouseDown) {
            const deltaX = event.clientX - startX
            const deltaY = event.clientY - startY
            startX = event.clientX
            startY = event.clientY

            currentAzimuthAngle -= deltaX * mouseRotationSensitivity
            currentPolarAngle = Math.max(
                0.2,
                Math.min(
                    1,
                    currentPolarAngle - deltaY * mouseRotationSensitivity
                )
            )

            controls.minPolarAngle = currentPolarAngle
            controls.maxPolarAngle = currentPolarAngle
            controls.minAzimuthAngle = currentAzimuthAngle
            controls.maxAzimuthAngle = currentAzimuthAngle
            controls.update()
        }
    }

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

    const handleWheel = (event: WheelEvent) => {
        // Adjust the target distance based on scroll wheel movement
        targetDistance = Math.max(
            controls.minDistance,
            Math.min(controls.maxDistance, targetDistance + event.deltaY * 0.05)
        )
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
        controls.target.copy(player.position)

        if (isUserInteracting) {
            // Skip updating angles based on keyboard if the user is interacting with the mouse
            const direction = new THREE.Vector3()
                .copy(camera.position)
                .sub(player.position)
                .normalize()

            camera.position.copy(
                player.position
                    .clone()
                    .addScaledVector(direction, initialDistance)
            )
            controls.update()
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
                .sub(player.position)
                .normalize()

            let newCameraPosition = new THREE.Vector3()
                .copy(player.position)
                .addScaledVector(direction, targetDistance)

            // Update the camera's position smoothly
            camera.position.lerp(newCameraPosition, cameraFloatEasing)
            controls.update()
        }

        requestAnimationFrame(animate)
    }

    createEffect(() => {
        scene.add(camera)
        targetDistance = camera.position.distanceTo(player.position)
        animate()

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('wheel', handleWheel, { passive: true })

        onCleanup(() => {
            scene.remove(camera)
            controls.dispose()
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('wheel', handleWheel)
        })
    })

    return null
}

export default PlayerCamera
