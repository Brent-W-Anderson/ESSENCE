import * as Ammo from 'ammojs3'
import { Component, createEffect, createSignal } from 'solid-js'
import * as THREE from 'three'
import PlayerMovementPointer from './PlayerMovementPointer'
import { useSceneContext } from './SceneContext'

const playerMovementSpeed = 12
const playerRotationSpeed = 0.15

const PlayerMovement: Component<{
    rigidPlayerRef: Ammo.default.btRigidBody
    floorRef: THREE.Object3D
}> = ({ rigidPlayerRef, floorRef }) => {
    const context = useSceneContext()
    if (!context) return

    const [mouse, setMouse] = createSignal(new THREE.Vector2(0, 0))
    const { scene, camera } = context
    let targetPos = new THREE.Vector3()
    let intervalId: number | null = null
    let pointer: THREE.Object3D | null = null

    const updateMousePosition = (event: MouseEvent) => {
        setMouse(
            new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            )
        )
    }

    const updateTargetPosition = () => {
        const mouseVec = mouse()
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouseVec, camera)

        const intersects = raycaster.intersectObjects([floorRef])
        if (intersects.length > 0) {
            targetPos = intersects[0].point
            if (pointer) {
                pointer.position.set(targetPos.x, 0, targetPos.z)
                pointer.visible = true
            }
        }
    }

    const onMouseDown = (event: MouseEvent) => {
        // left-click
        if (event.button === 0) {
            updateMousePosition(event)
            updateTargetPosition()

            intervalId = window.setInterval(updateTargetPosition, 10)
        }
    }

    const onMouseUp = (event: MouseEvent) => {
        if (event.button === 0 && intervalId !== null) {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    const calculateDirectionToTarget = (currentPosition: THREE.Vector3) => {
        if (targetPos.equals(new THREE.Vector3(0, 0, 0))) {
            return {
                directionToTarget: new THREE.Vector3(),
                distanceToTarget: 0
            }
        }

        const directionToTarget = new THREE.Vector3(
            targetPos.x - currentPosition.x,
            0,
            targetPos.z - currentPosition.z
        )
        const distanceToTarget = directionToTarget.length()
        directionToTarget.normalize()

        return { directionToTarget, distanceToTarget }
    }

    const applyMovementForce = (
        directionToTarget: THREE.Vector3,
        distanceToTarget: number,
        ammo: typeof Ammo.default
    ) => {
        let forceMagnitude = playerMovementSpeed
        let adjusted = false

        // prevents stutter by exponentially slowing down within for-loop.
        const maxStopDistance = Math.ceil(playerMovementSpeed / 4)
        for (let i = 1; i <= maxStopDistance; i++) {
            const minForce = (i - 1) * 4
            const maxForce = i * 4
            if (forceMagnitude <= maxForce && distanceToTarget <= i) {
                forceMagnitude = playerMovementSpeed * (distanceToTarget / i)
                adjusted = true
                break
            }
        }

        if (!adjusted) {
            forceMagnitude = playerMovementSpeed
        }

        if (distanceToTarget > 0.5) {
            // half of player object width.
            const translationalForce = new ammo.btVector3(
                directionToTarget.x * forceMagnitude,
                rigidPlayerRef.getLinearVelocity().y(),
                directionToTarget.z * forceMagnitude
            )
            rigidPlayerRef.activate()
            rigidPlayerRef.setLinearVelocity(translationalForce)
            ammo.destroy(translationalForce)
        } else {
            if (pointer) {
                pointer.visible = false
                // Clear the target position
                targetPos.set(0, 0, 0)
            }
        }
    }

    const applyRotation = (
        directionToTarget: THREE.Vector3,
        distanceToTarget: number,
        ammo: typeof Ammo.default
    ) => {
        if (distanceToTarget > 0.5) {
            // half of player object width.
            // Compute the rotation quaternion to look at the target
            const currentTransform = rigidPlayerRef.getWorldTransform()
            const currentRotation = currentTransform.getRotation()
            const currentQuat = new THREE.Quaternion(
                currentRotation.x(),
                currentRotation.y(),
                currentRotation.z(),
                currentRotation.w()
            )

            // Calculate the target quaternion
            const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1), // Assuming the object's forward direction is +Z
                directionToTarget.clone().normalize()
            )

            // Interpolate between the current and target quaternion
            currentQuat.slerp(targetQuaternion, playerRotationSpeed)

            // Update the rigid body rotation
            currentTransform.setRotation(
                new ammo.btQuaternion(
                    currentQuat.x,
                    currentQuat.y,
                    currentQuat.z,
                    currentQuat.w
                )
            )
            rigidPlayerRef.setWorldTransform(currentTransform)
        }
    }

    const animatePlayer = () => {
        const ammo = context.AmmoLib()

        const transform = new ammo.btTransform()
        rigidPlayerRef.getMotionState().getWorldTransform(transform)
        const origin = transform.getOrigin()
        const currentPosition = new THREE.Vector3(
            origin.x(),
            origin.y(),
            origin.z()
        )

        const { directionToTarget, distanceToTarget } =
            calculateDirectionToTarget(currentPosition)
        applyMovementForce(directionToTarget, distanceToTarget, ammo)
        applyRotation(directionToTarget, distanceToTarget, ammo)

        ammo.destroy(transform)
        requestAnimationFrame(animatePlayer)
    }

    createEffect(() => {
        document.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mouseup', onMouseUp)
        document.addEventListener('mousemove', updateMousePosition)

        animatePlayer()

        return () => {
            document.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('mouseup', onMouseUp)
            document.removeEventListener('mousemove', updateMousePosition)

            if (intervalId !== null) {
                clearInterval(intervalId)
            }
        }
    })

    return (
        <PlayerMovementPointer
            scene={scene}
            onPointerCreated={obj => (pointer = obj)}
        />
    )
}

export default PlayerMovement
