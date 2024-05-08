import { Component, createEffect, createSignal } from 'solid-js'
import * as THREE from 'three'
import PlayerMovementPointer from './PlayerMovementPointer'
import { useSceneContext } from './SceneContext'
import * as Ammo from 'ammojs3'

interface PlayerMovementProps {
    rigidPlayerRef: Ammo.default.btRigidBody
    floorRef: THREE.Object3D
}

const PlayerMovement: Component<PlayerMovementProps> = ({
    rigidPlayerRef,
    floorRef
}) => {
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
        if (event.button === 0) {
            updateMousePosition(event)
            updateTargetPosition()

            intervalId = window.setInterval(updateTargetPosition, 100)
        }
    }

    const onMouseUp = (event: MouseEvent) => {
        if (event.button === 0 && intervalId !== null) {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    const animateCube = () => {
        const ammo = context.AmmoLib()

        const transform = new ammo.btTransform()
        rigidPlayerRef.getMotionState().getWorldTransform(transform)
        const origin = transform.getOrigin()
        const currentPosition = new THREE.Vector3(
            origin.x(),
            origin.y(),
            origin.z()
        )

        const directionToTarget = new THREE.Vector3(
            targetPos.x - currentPosition.x,
            0,
            targetPos.z - currentPosition.z
        )
        const distanceToTarget = directionToTarget.length()
        directionToTarget.normalize()

        const baseForceMagnitude = 5
        const forceMagnitude =
            distanceToTarget > 2
                ? baseForceMagnitude
                : baseForceMagnitude * (distanceToTarget / 2)

        if (distanceToTarget > 0.5) {
            const translationalForce = new ammo.btVector3(
                directionToTarget.x * forceMagnitude,
                0,
                directionToTarget.z * forceMagnitude
            )
            rigidPlayerRef.activate()
            rigidPlayerRef.setLinearVelocity(translationalForce)
            ammo.destroy(translationalForce)
        } else {
            if (pointer) {
                pointer.visible = false
            }
        }

        ammo.destroy(transform)

        requestAnimationFrame(animateCube)
    }

    createEffect(() => {
        document.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mouseup', onMouseUp)
        document.addEventListener('mousemove', updateMousePosition)

        animateCube()

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
