import { Component, onCleanup } from 'solid-js'
import { Box3, Mesh, Raycaster, Vector2 } from 'three'
import { usePlayerMovementContext } from './Context'
import { useSceneContext } from '@/components/_Scene/Context'

// TODO: add applyMovementForce() & applyRotation() to the MouseHanglers,
// since this belongs with the mouse logic.

export const MouseHandlers: Component = () => {
    const context = useSceneContext()!
    const movementContext = usePlayerMovementContext()!

    const { scene, camera, renderer } = context
    const {
        mouse: [mouse, setMouse],
        pointer: [pointer],
        intervalIdRef,
        isRightClickHeldRef,
        targetPos
    } = movementContext

    const updateMousePosition = (event: MouseEvent) => {
        const mouseVec = new Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        )
        setMouse(mouseVec)

        const raycaster = new Raycaster()
        raycaster.setFromCamera(mouseVec, camera!)

        if (isRightClickHeldRef.current) {
            renderer!.domElement.style.cursor = 'grabbing'
        } else {
            renderer!.domElement.style.cursor = 'default'
        }
    }

    const updateTargetPosition = () => {
        if (!camera) return

        const raycaster = new Raycaster()
        raycaster.setFromCamera(mouse(), camera)

        const meshChildren = scene!.children.filter(
            child => child instanceof Mesh
        )
        const intersects = raycaster.intersectObjects(meshChildren, true)

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object
            const intersectPoint = intersects[0].point

            const boundingBox = new Box3().setFromObject(intersectedObject)

            if (intersectPoint.y <= boundingBox.max.y) {
                targetPos.set(
                    intersectPoint.x,
                    intersectPoint.y + 0.1,
                    intersectPoint.z
                )
            }
        } else {
            targetPos.set(0, 0, 0)
        }
    }

    const onMouseUp = (event: MouseEvent) => {
        if (event.button === 0) {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current)
                intervalIdRef.current = null
            }

            updateTargetPosition()

            if (pointer() && targetPos.y !== 0) {
                pointer()?.position.set(targetPos.x, targetPos.y, targetPos.z)
                pointer()!.visible = true
            } else if (pointer) {
                pointer()!.visible = false
            }
        } else if (event.button === 2) {
            isRightClickHeldRef.current = false
            updateMousePosition(event)
        }
    }

    const onMouseDown = (event: MouseEvent) => {
        if (event.button === 0) {
            updateMousePosition(event)
            updateTargetPosition()

            if (pointer()) {
                pointer()!.visible = false
            }
            if (intervalIdRef.current === null) {
                intervalIdRef.current = window.setInterval(() => {
                    updateTargetPosition()
                }, 50)
            }
        } else if (event.button === 2) {
            isRightClickHeldRef.current = true
            updateMousePosition(event)
        }
    }

    document.addEventListener('mousedown', e => onMouseDown(e))
    document.addEventListener('mouseup', e => onMouseUp(e))
    document.addEventListener('mousemove', e => updateMousePosition(e))

    onCleanup(() => {
        document.removeEventListener('mousedown', e => onMouseDown(e))
        document.removeEventListener('mouseup', e => onMouseUp(e))
        document.removeEventListener('mousemove', e => updateMousePosition(e))

        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current)
        }
    })

    return pointer() && null
}
