import { createEffect, onCleanup, Component } from 'solid-js'
import { MOUSE, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useSceneContext } from '@/components/_Scene/Context'
import { PLAYER } from '@/config'

const PlayerCamera: Component = () => {
    const { camera, renderer, playerRef } = useSceneContext()!
    const player = playerRef!()! // make sure this exists before mounting

    createEffect( () => {
    // Create controls *inside* the effect
        const controls = new OrbitControls( camera(), renderer.domElement )
        controls.enablePan = false
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.minPolarAngle = 0.2
        controls.maxPolarAngle = 1
        controls.rotateSpeed = 0.5
        controls.minDistance = 10
        controls.maxDistance = 20
        controls.zoomSpeed = 3
        controls.mouseButtons = {
            LEFT: null,
            RIGHT: MOUSE.ROTATE
        }
        controls.update()

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

        const playerHeightOffset = new Vector3( 0, 1.5, 0 )
        const targetPosition = new Vector3()

        const setInitialCameraPosition = () => {
            const spherical = new Vector3()
            const radius = targetDistance
            spherical.setFromSphericalCoords(
                radius,
                currentPolarAngle,
                currentAzimuthAngle
            )
            camera().position.copy( player.position ).add( spherical )
            controls.target.copy( player.position ).add( playerHeightOffset )
            controls.update()
        }
        setInitialCameraPosition()
        targetDistance = camera().position.distanceTo( player.position )

        const keysPressed: Record<string, {
            pressed: boolean;
            speed: number
        }> = {
            ArrowUp: {
                pressed: false,
                speed: 0.01
            },
            ArrowLeft: {
                pressed: false,
                speed: arrowKeyRotationSensitivity
            },
            ArrowDown: {
                pressed: false,
                speed: 0.01
            },
            ArrowRight: {
                pressed: false,
                speed: arrowKeyRotationSensitivity
            }
        }

        const handleMouseDown = ( e: MouseEvent ) => {
            if ( e.button === 2 ) {
                mouseDown = true
                startX = e.clientX
                startY = e.clientY
                isUserInteracting = true
                currentPolarAngle = controls.getPolarAngle()
                currentAzimuthAngle = controls.getAzimuthalAngle()
            }
        }
        const handleMouseUp = ( e: MouseEvent ) => {
            if ( e.button === 2 ) {
                mouseDown = false
                isUserInteracting = false
            }
        }
        const handleMouseMove = ( e: MouseEvent ) => {
            if ( !mouseDown ) return
            const deltaX = e.clientX - startX
            const deltaY = e.clientY - startY
            startX = e.clientX
            startY = e.clientY

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
        const handleKeyDown = ( e: KeyboardEvent ) => {
            if ( e.key in keysPressed ) keysPressed[e.key].pressed = true
        }
        const handleKeyUp = ( e: KeyboardEvent ) => {
            if ( e.key in keysPressed ) keysPressed[e.key].pressed = false
        }
        const handleWheel = ( e: WheelEvent ) => {
            targetDistance = Math.max(
                controls.minDistance,
                Math.min(
                    controls.maxDistance,
                    targetDistance + e.deltaY * 0.05
                )
            )
        }

        const updateCameraAngles = () => {
            if ( keysPressed.ArrowUp.pressed ) {
                currentPolarAngle = Math.max(
                    0.2,
                    currentPolarAngle - keysPressed.ArrowUp.speed
                )
            }

            if ( keysPressed.ArrowDown.pressed ) {
                currentPolarAngle = Math.min(
                    1,
                    currentPolarAngle + keysPressed.ArrowDown.speed
                )
            }

            if ( keysPressed.ArrowLeft.pressed ) {
                currentAzimuthAngle += keysPressed.ArrowLeft.speed
            }

            if ( keysPressed.ArrowRight.pressed ) {
                currentAzimuthAngle -= keysPressed.ArrowRight.speed
            }

            if ( !isUserInteracting ) {
                currentPolarAngle = controls.getPolarAngle()
                currentAzimuthAngle = controls.getAzimuthalAngle()
            }

            if ( floatPolarAngle ) {
                controls.minPolarAngle = 0.2
                controls.maxPolarAngle = 1
            } else {
                controls.minPolarAngle = currentPolarAngle
                controls.maxPolarAngle = currentPolarAngle
            }
            if ( floatAzimuthAngle ) {
                controls.minAzimuthAngle = -Infinity
                controls.maxAzimuthAngle = Infinity
            } else {
                controls.minAzimuthAngle = currentAzimuthAngle
                controls.maxAzimuthAngle = currentAzimuthAngle
            }

            controls.update()
        }

        let raf = 0
        const animate = () => {
            targetPosition.copy( player.position ).add( playerHeightOffset )
            controls.target.copy( targetPosition )

            if ( !isUserInteracting ) {
                updateCameraAngles()
                const direction = new Vector3().copy( camera().position )
                    .sub( player.position ).normalize()
                const newCameraPosition = new Vector3().copy( player.position )
                    .addScaledVector( direction, targetDistance )
                camera().position.lerp( newCameraPosition, cameraFloatEasing )
            } else {
                const direction = new Vector3().copy( camera().position )
                    .sub( player.position ).normalize()
                camera().position.copy( player.position.clone()
                    .addScaledVector( direction, targetDistance ) )
                currentPolarAngle = controls.getPolarAngle()
                currentAzimuthAngle = controls.getAzimuthalAngle()
            }

            controls.update()
            raf = requestAnimationFrame( animate )
        }
        raf = requestAnimationFrame( animate )

        window.addEventListener( 'keydown', handleKeyDown )
        window.addEventListener( 'keyup', handleKeyUp )
        window.addEventListener( 'mousedown', handleMouseDown )
        window.addEventListener( 'mouseup', handleMouseUp )
        window.addEventListener( 'mousemove', handleMouseMove )
        window.addEventListener( 'wheel', handleWheel, { passive: true } )

        onCleanup( () => {
            cancelAnimationFrame( raf )
            window.removeEventListener( 'keydown', handleKeyDown )
            window.removeEventListener( 'keyup', handleKeyUp )
            window.removeEventListener( 'mousedown', handleMouseDown )
            window.removeEventListener( 'mouseup', handleMouseUp )
            window.removeEventListener( 'mousemove', handleMouseMove )
            window.removeEventListener( 'wheel', handleWheel )
            controls.dispose()
        } )
    } )

    return null
}

export default PlayerCamera