import { Component, createEffect, onMount } from 'solid-js'
import {
    BufferGeometry,
    Line,
    LineBasicMaterial,
    Quaternion,
    Vector3
} from 'three'
import { usePlayerMovementContext } from './Context'
import PlayerMovementIndicator from './Indicator'
import { MouseHandlers } from './MouseHandlers'
import { useSceneContext } from '@/components/_Scene/Context'
import { PLAYER } from '@/config'

// TODO: split off key-bindings into their own component,
// just like the MouseHandlers.

const PlayerMovement: Component = () => {
    const context = useSceneContext()!
    const movementContext = usePlayerMovementContext()!
    const rigidPlayer = context.rigidPlayerRef!()

    const {
        targetPos,
        intervalIdRef,
        pointer: [pointer],
        rayLines: [rayLines, setRayLines]
    } = movementContext
    let { isJumping, canJump, lastJumpPressTime } = movementContext
    let { isWKeyDown, isAKeyDown, isSKeyDown, isDKeyDown } = movementContext
    let { lastPosition, movementTimeout, canJumpTimeout } = movementContext

    const onKeyDown = (event: KeyboardEvent) => {
        const currentTime = Date.now()
        if (
            event.key === ' ' &&
            currentTime - lastJumpPressTime > PLAYER.JUMPING.jumpingThreshold
        ) {
            isJumping = true
            lastJumpPressTime = currentTime
        }

        if (event.key === 'w') {
            isWKeyDown = true
            targetPos.set(0, 0, 0)
        }
        if (event.key === 'a') {
            isAKeyDown = true
            targetPos.set(0, 0, 0)
        }
        if (event.key === 's') {
            isSKeyDown = true
            targetPos.set(0, 0, 0)
        }
        if (event.key === 'd') {
            isDKeyDown = true
            targetPos.set(0, 0, 0)
        }

        updatePlayerFriction(0)
    }

    const onKeyUp = (event: KeyboardEvent) => {
        if (event.key === 'w') {
            isWKeyDown = false
        }
        if (event.key === 'a') {
            isAKeyDown = false
        }
        if (event.key === 's') {
            isSKeyDown = false
        }
        if (event.key === 'd') {
            isDKeyDown = false
        }

        if (!isWKeyDown && !isAKeyDown && !isSKeyDown && !isDKeyDown) {
            updatePlayerFriction(1)
        }
    }

    const movePlayer = () => {
        const ammo = context.AmmoLib()
        if (!ammo) return

        const transform = new ammo.btTransform()
        rigidPlayer.getMotionState().getWorldTransform(transform)

        const cameraDirection = new Vector3()
        context.camera().getWorldDirection(cameraDirection)
        cameraDirection.y = 0 // Ensure the player stays on the ground plane
        cameraDirection.normalize()

        let direction = new Vector3()
        if (isWKeyDown) {
            direction.add(cameraDirection)
        }
        if (isSKeyDown) {
            direction.add(cameraDirection.clone().negate())
        }
        if (isAKeyDown) {
            direction.add(
                cameraDirection
                    .clone()
                    .applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
            )
        }
        if (isDKeyDown) {
            direction.add(
                cameraDirection
                    .clone()
                    .applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2)
            )
        }

        if (direction.length() === 0) {
            // Apply slowing down logic
            const currentVelocity = rigidPlayer.getLinearVelocity()
            const speed = Math.sqrt(
                currentVelocity.x() * currentVelocity.x() +
                    currentVelocity.z() * currentVelocity.z()
            )

            if (speed > 0.01) {
                const slowDownFactor = 0.1
                const newVelocity = new ammo.btVector3(
                    currentVelocity.x() * slowDownFactor,
                    currentVelocity.y(),
                    currentVelocity.z() * slowDownFactor
                )
                rigidPlayer.setLinearVelocity(newVelocity)
                ammo.destroy(newVelocity)
            }

            ammo.destroy(transform)
            return
        }

        direction.normalize()

        const forceMagnitude = PLAYER.MOVEMENT.movementSpeed
        const movementForce = new ammo.btVector3(
            direction.x * forceMagnitude,
            rigidPlayer.getLinearVelocity().y(),
            direction.z * forceMagnitude
        )

        // Update rotation to face the movement direction smoothly
        const currentTransform = rigidPlayer.getWorldTransform()
        const currentRotation = currentTransform.getRotation()
        const currentQuat = new Quaternion(
            currentRotation.x(),
            currentRotation.y(),
            currentRotation.z(),
            currentRotation.w()
        )

        // Calculate the target quaternion
        const targetQuaternion = new Quaternion().setFromUnitVectors(
            new Vector3(0, 0, 1), // Assuming the object's forward direction is +Z
            direction.clone()
        )

        // Interpolate between the current and target quaternion
        currentQuat.slerp(targetQuaternion, PLAYER.MOVEMENT.rotationSpeed)

        // Update the rigid body rotation smoothly
        currentTransform.setRotation(
            new ammo.btQuaternion(
                currentQuat.x,
                currentQuat.y,
                currentQuat.z,
                currentQuat.w
            )
        )
        rigidPlayer.setWorldTransform(currentTransform)

        rigidPlayer.activate()
        rigidPlayer.setLinearVelocity(movementForce)

        ammo.destroy(movementForce)
        ammo.destroy(transform)
    }

    const calculateDirectionToTarget = (currentPosition: Vector3) => {
        if (targetPos.equals(new Vector3(0, 0, 0))) {
            return {
                directionToTarget: new Vector3(),
                distanceToTarget: 0
            }
        }

        const directionToTarget = new Vector3(
            targetPos.x - currentPosition.x,
            0,
            targetPos.z - currentPosition.z
        )
        const distanceToTarget = directionToTarget.length()
        directionToTarget.normalize()

        return { directionToTarget, distanceToTarget }
    }

    const applyMovementForce = (
        directionToTarget: Vector3,
        distanceToTarget: number,
        ammo: typeof window.Ammo
    ) => {
        let forceMagnitude = PLAYER.MOVEMENT.movementSpeed
        let adjusted = false

        // prevents stutter by exponentially slowing down within for-loop.
        const maxStopDistance = Math.ceil(PLAYER.MOVEMENT.movementSpeed / 4)
        for (let i = 1; i <= maxStopDistance; i++) {
            const maxForce = i * 4
            if (forceMagnitude <= maxForce && distanceToTarget <= i) {
                forceMagnitude =
                    PLAYER.MOVEMENT.movementSpeed * (distanceToTarget / i)
                adjusted = true
                break
            }
        }

        if (!adjusted) {
            forceMagnitude = PLAYER.MOVEMENT.movementSpeed
        }

        if (distanceToTarget > 0.5) {
            // half of player object width.
            const translationalForce = new ammo.btVector3(
                directionToTarget.x * forceMagnitude,
                rigidPlayer.getLinearVelocity().y(),
                directionToTarget.z * forceMagnitude
            )
            rigidPlayer.activate()
            rigidPlayer.setLinearVelocity(translationalForce)
            ammo.destroy(translationalForce)
            pointer()?.position.set(targetPos.x, targetPos.y, targetPos.z)
            updatePlayerFriction(0)
        } else if (pointer()) {
            pointer()!.visible = false
            // Clear the target position
            targetPos.set(0, 0, 0)
            if (!isWKeyDown && !isAKeyDown && !isSKeyDown && !isDKeyDown) {
                updatePlayerFriction(1)
            }
        }
    }

    const applyRotation = (
        directionToTarget: Vector3,
        distanceToTarget: number,
        ammo: typeof window.Ammo
    ) => {
        if (distanceToTarget > 0.5) {
            // half of player object width.
            // Compute the rotation quaternion to look at the target
            const currentTransform = rigidPlayer.getWorldTransform()
            const currentRotation = currentTransform.getRotation()
            const currentQuat = new Quaternion(
                currentRotation.x(),
                currentRotation.y(),
                currentRotation.z(),
                currentRotation.w()
            )

            // Calculate the target quaternion
            const targetQuaternion = new Quaternion().setFromUnitVectors(
                new Vector3(0, 0, 1), // Assuming the object's forward direction is +Z
                directionToTarget.clone().normalize()
            )

            // Interpolate between the current and target quaternion
            currentQuat.slerp(targetQuaternion, PLAYER.MOVEMENT.rotationSpeed)

            // Update the rigid body rotation
            currentTransform.setRotation(
                new ammo.btQuaternion(
                    currentQuat.x,
                    currentQuat.y,
                    currentQuat.z,
                    currentQuat.w
                )
            )
            rigidPlayer.setWorldTransform(currentTransform)
        }
    }

    const applyJumpForce = (ammo: typeof window.Ammo) => {
        if (isJumping) {
            const currentVelocity = rigidPlayer.getLinearVelocity()

            if (
                Math.abs(currentVelocity.y()) <
                PLAYER.JUMPING.fallVelocityTolerance
            ) {
                const jumpVelocity = new ammo.btVector3(
                    currentVelocity.x(),
                    PLAYER.JUMPING.jumpForce,
                    currentVelocity.z()
                )
                rigidPlayer!.setLinearVelocity(jumpVelocity)
                rigidPlayer.activate()
                ammo.destroy(jumpVelocity)
                isJumping = false
            }

            ammo.destroy(currentVelocity)
        }
    }

    const initializeRayLines = () => {
        const rayCount = 12 // Number of rays to form the quarter-ring
        const radius = 2 // Radius of the ring around the player
        const lines: Line[] = []

        for (let i = 0; i < rayCount; i++) {
            const angle = (i / (rayCount - 1)) * (Math.PI / 2) - Math.PI / 4 // Adjusted to be in front of the player
            const offsetX = Math.cos(angle + Math.PI / 2) * radius // Shift by 90 degrees to the front
            const offsetZ = Math.sin(angle + Math.PI / 2) * radius // Shift by 90 degrees to the front

            const startVec = new Vector3(offsetX, 0, offsetZ)
            const endVec = new Vector3(
                offsetX,
                -PLAYER.BUMPER.stepHeight,
                offsetZ
            )

            const material = new LineBasicMaterial({ color: 0xff0000 })
            const geometry = new BufferGeometry().setFromPoints([
                startVec,
                endVec
            ])
            const line = new Line(geometry, material)
            line.frustumCulled = false
            line.visible = PLAYER.BUMPER.showRayLines

            context.scene.add(line)
            lines.push(line)
        }

        setRayLines(lines)
    }

    const updateRayLines = (
        origin: Vector3,
        rotation: Quaternion,
        playerHalfHeight: number
    ) => {
        const radius = 2
        const lines = rayLines()

        for (let i = 0; i < lines.length; i++) {
            const angle = (i / (lines.length - 1)) * (Math.PI / 2) - Math.PI / 4 // Adjusted to be in front of the player
            const offsetX = Math.cos(angle + Math.PI / 2) * radius // Shift by 90 degrees to the front
            const offsetZ = Math.sin(angle + Math.PI / 2) * radius // Shift by 90 degrees to the front

            const offset = new Vector3(offsetX, 0, offsetZ)
            offset.applyQuaternion(rotation)

            const rayStart = new Vector3(
                origin.x + offset.x,
                origin.y - playerHalfHeight + PLAYER.BUMPER.stepHeight, // Adjust starting height
                origin.z + offset.z
            )
            const rayEnd = new Vector3(
                rayStart.x,
                rayStart.y - PLAYER.BUMPER.stepHeight, // Extend ray length further
                rayStart.z
            )

            // Update the line geometry
            const geometry = lines[i].geometry as BufferGeometry
            geometry.setFromPoints([rayStart, rayEnd])
        }
    }

    onMount(() => {
        initializeRayLines()
    })

    const calculateAmmoHeight = (height: number) => {
        if (height <= 1) {
            return height + 0.5
        } else if (height <= 2) {
            return height
        } else {
            return 2 + (height - 2) * 0.5
        }
    }

    const detectAndStepOverLedges = (ammo: typeof window.Ammo) => {
        const currentVelocity = rigidPlayer.getLinearVelocity()
        const transform = new ammo.btTransform()
        rigidPlayer.getMotionState().getWorldTransform(transform)
        const origin = transform.getOrigin()

        // Check if the player is in the air or below the required height
        if (
            Math.abs(currentVelocity.y()) >
                PLAYER.JUMPING.fallVelocityTolerance ||
            (!PLAYER.JUMPING.allowJumpClimbing && currentVelocity.y() < 0) ||
            origin.y() < calculateAmmoHeight(4) - 0.1 // tolerance
        ) {
            ammo.destroy(transform)
            return // Skip ledge detection if the player is in the air or below -0.1
        }

        const rotation = new Quaternion(
            transform.getRotation().x(),
            transform.getRotation().y(),
            transform.getRotation().z(),
            transform.getRotation().w()
        )

        const playerHalfHeight = calculateAmmoHeight(4) - 0.2

        // Update ray lines positions
        updateRayLines(
            new Vector3(origin.x(), origin.y(), origin.z()),
            rotation,
            playerHalfHeight
        )

        const lines = rayLines()
        for (let i = 0; i < lines.length; i++) {
            const rayStart = new ammo.btVector3(
                lines[i].geometry.attributes.position.array[0],
                lines[i].geometry.attributes.position.array[1],
                lines[i].geometry.attributes.position.array[2]
            )
            const rayEnd = new ammo.btVector3(
                lines[i].geometry.attributes.position.array[3],
                lines[i].geometry.attributes.position.array[4],
                lines[i].geometry.attributes.position.array[5]
            )

            const rayCallback = new ammo.ClosestRayResultCallback(
                rayStart,
                rayEnd
            )
            context.physicsWorld?.()?.rayTest(rayStart, rayEnd, rayCallback)

            if (rayCallback.hasHit() && canJump) {
                updatePlayerFriction(0)

                // Apply a small vertical force to step over the ledge
                const stepUpVelocity = new ammo.btVector3(
                    rigidPlayer.getLinearVelocity().x(),
                    PLAYER.JUMPING.jumpForce / 2, // Adjust as needed
                    rigidPlayer.getLinearVelocity().z()
                )
                rigidPlayer.setLinearVelocity(stepUpVelocity)
                ammo.destroy(stepUpVelocity)
            }

            ammo.destroy(rayStart)
            ammo.destroy(rayEnd)
            ammo.destroy(rayCallback)
        }

        ammo.destroy(transform)
    }

    const animatePlayer = () => {
        const ammo = context.AmmoLib()

        const transform = new ammo!.btTransform()
        rigidPlayer.getMotionState().getWorldTransform(transform)
        const origin = transform.getOrigin()
        const currentPosition = new Vector3(origin.x(), origin.y(), origin.z())

        movePlayer()

        const { directionToTarget, distanceToTarget } =
            calculateDirectionToTarget(currentPosition)
        applyMovementForce(directionToTarget, distanceToTarget, ammo!)
        applyRotation(directionToTarget, distanceToTarget, ammo!)
        applyJumpForce(ammo!)
        detectAndStepOverLedges(ammo!)

        ammo?.destroy(transform)

        // Check for movement in the x or z direction
        if (
            Math.abs(currentPosition.x - lastPosition.x) < 0.01 &&
            Math.abs(currentPosition.z - lastPosition.z) < 0.01 &&
            !isWKeyDown &&
            !isAKeyDown &&
            !isSKeyDown &&
            !isDKeyDown
        ) {
            if (movementTimeout === null) {
                movementTimeout = window.setTimeout(() => {
                    targetPos.set(0, 0, 0)
                    movementTimeout = null
                }, PLAYER.MOVEMENT.INDICATOR.threshold)
            }
            if (canJumpTimeout === null) {
                canJumpTimeout = window.setTimeout(() => {
                    canJump = false
                    canJumpTimeout = null
                }, PLAYER.BUMPER.canJumpWithRayLinesThreshold)
            }
        } else {
            if (movementTimeout !== null) {
                clearTimeout(movementTimeout)
                movementTimeout = null
            }
            if (canJumpTimeout !== null) {
                clearTimeout(canJumpTimeout)
                canJumpTimeout = null
            }
            canJump = true // Allow jumping via ray lines if the player is moving
        }

        lastPosition.copy(currentPosition)
        requestAnimationFrame(animatePlayer)
    }

    const updatePlayerFriction = (friction: number) => {
        const ammo = context.AmmoLib()
        if (!ammo) return
        rigidPlayer.setFriction(friction)
    }

    createEffect(() => {
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('keyup', onKeyUp)

        animatePlayer()

        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.removeEventListener('keyup', onKeyUp)

            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current)
            }

            if (movementTimeout !== null) {
                clearTimeout(movementTimeout)
            }

            if (canJumpTimeout !== null) {
                clearTimeout(canJumpTimeout)
            }
        }
    })

    return (
        <>
            <PlayerMovementIndicator />
            <MouseHandlers />
        </>
    )
}

export default PlayerMovement
