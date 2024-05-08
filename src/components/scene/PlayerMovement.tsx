import { Component, createEffect, createSignal } from 'solid-js'
import * as THREE from 'three'
import PlayerMovementPointer from './PlayerMovementPointer'
import { useSceneContext } from './SceneContext'

interface PlayerMovementProps {
    cubeRef: THREE.Object3D
    floorRef: THREE.Object3D
}

const PlayerMovement: Component<PlayerMovementProps> = ({
    cubeRef,
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
        const direction = new THREE.Vector3(
            targetPos.x - cubeRef.position.x,
            0,
            targetPos.z - cubeRef.position.z
        )

        const targetAngle = Math.atan2(direction.x, direction.z) + Math.PI
        const targetQuaternion = new THREE.Quaternion()
        targetQuaternion.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            targetAngle
        )

        const distance = cubeRef.position.distanceTo(targetPos)
        const movementSpeed = 0.1
        const rotationSpeed = 0.1

        if (distance > 1.1) {
            const step = direction.multiplyScalar(movementSpeed / distance)
            cubeRef.quaternion.slerp(targetQuaternion, rotationSpeed)
            cubeRef.position.add(step)
            camera.position.add(step)
        } else {
            if (pointer) {
                pointer.visible = false
            }
        }

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
