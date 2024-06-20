import { createEffect, onCleanup, Component } from 'solid-js'
import { MOUSE, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useSceneContext } from '@/components/_Scene/Context'
import { PLAYER } from '@/config'

const PlayerCamera: Component = () => {
    const context = useSceneContext()!
    const player = context.playerRef!()!
    const { scene, camera, renderer } = context
    const controls = new OrbitControls(camera(), renderer.domElement)
    const {
        floatPolarAngle,
        floatAzimuthAngle,
        cameraFloatEasing,
        arrowKeyRotationSensitivity,
        mouseRotationSensitivity
    } = PLAYER.CAMERA
    let { currentPolarAngle, currentAzimuthAngle, distance } = PLAYER.CAMERA

    let targetDistance = distance
    let isUserInteracting = false
    let mouseDown = false
    let startX = 0
    let startY = 0

    // Limit controls to prevent panning
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Limit rotation range
    controls.minPolarAngle = 0.2
    controls.maxPolarAngle = 1
    controls.rotateSpeed = 0.5

    // Set zoom distance limits
    controls.minDistance = 10
    controls.maxDistance = 20
    controls.zoomSpeed = 3

    // Define the offset for targeting the top of the player
    const playerHeightOffset = new Vector3(0, 1.5, 0)
    const targetPosition = new Vector3()

    controls.mouseButtons = {
        LEFT: null,
        RIGHT: MOUSE.ROTATE
    }
    controls.update()

    const setInitialCameraPosition = () => {
        const spherical = new Vector3()
        const radius = targetDistance
        spherical.setFromSphericalCoords(
            radius,
            currentPolarAngle,
            currentAzimuthAngle
        )
        camera().position.copy(player.position).add(spherical)
        controls.target.copy(player.position).add(playerHeightOffset)
        controls.update()
    }

    const keysPressed: { [key: string]: { pressed: boolean; speed: number } } =
        {
            ArrowUp: { pressed: false, speed: 0.01 },
            ArrowLeft: { pressed: false, speed: arrowKeyRotationSensitivity },
            ArrowDown: { pressed: false, speed: 0.01 },
            ArrowRight: { pressed: false, speed: arrowKeyRotationSensitivity }
        }

    const handleMouseDown = (event: MouseEvent) => {
        if (event.button === 2) {
            mouseDown = true
            startX = event.clientX
            startY = event.clientY
            isUserInteracting = true

            // Synchronize current angles with the camera's actual angles
            currentPolarAngle = controls.getPolarAngle()
            currentAzimuthAngle = controls.getAzimuthalAngle()
        }
    }

    const handleMouseUp = (event: MouseEvent) => {
        if (event.button === 2) {
            mouseDown = false
            isUserInteracting = false
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

        if (!isUserInteracting) {
            currentPolarAngle = controls.getPolarAngle()
            currentAzimuthAngle = controls.getAzimuthalAngle()
        }

        if (floatPolarAngle) {
            controls.minPolarAngle = 0.2
            controls.maxPolarAngle = 1
        } else {
            controls.minPolarAngle = currentPolarAngle
            controls.maxPolarAngle = currentPolarAngle
        }

        if (floatAzimuthAngle) {
            controls.minAzimuthAngle = -Infinity
            controls.maxAzimuthAngle = Infinity
        } else {
            controls.minAzimuthAngle = currentAzimuthAngle
            controls.maxAzimuthAngle = currentAzimuthAngle
        }

        controls.update()
    }

    const animate = () => {
        targetPosition.copy(player.position).add(playerHeightOffset)
        controls.target.copy(targetPosition)

        if (!isUserInteracting) {
            updateCameraAngles()

            const direction = new Vector3()
                .copy(camera().position)
                .sub(player.position)
                .normalize()

            let newCameraPosition = new Vector3()
                .copy(player.position)
                .addScaledVector(direction, targetDistance)

            camera().position.lerp(newCameraPosition, cameraFloatEasing)
        } else {
            // Ensure the camera's distance to the player remains constant while interacting
            const direction = new Vector3()
                .copy(camera().position)
                .sub(player.position)
                .normalize()

            camera().position.copy(
                player.position
                    .clone()
                    .addScaledVector(direction, targetDistance)
            )

            // Synchronize current angles with the camera's actual angles continuously while interacting
            currentPolarAngle = controls.getPolarAngle()
            currentAzimuthAngle = controls.getAzimuthalAngle()
        }

        controls.update()
        requestAnimationFrame(animate)
    }

    createEffect(() => {
        scene.add(camera())
        setInitialCameraPosition()
        targetDistance = camera().position.distanceTo(player.position)
        animate()

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('wheel', handleWheel, { passive: true })

        onCleanup(() => {
            scene.remove(camera())
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
