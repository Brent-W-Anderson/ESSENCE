import { Component, createSignal, onCleanup, onMount } from 'solid-js'
import {
    ArrowHelper,
    Box3,
    Group,
    Object3D,
    Raycaster,
    Vector2,
    Vector3
} from 'three'
import { useSceneContext } from '@/components/_Scene/Context'
import { HELPERS } from '@/config'

// TODO: add functionality for ctrl + hover & left-click to lock the coordinates visibility = true.
// this should still only stay visible under a distance of <= 50.

const AxisArrows: Component<{
    mesh: Object3D
    helper: Group
    rigidHalfHeight?: number
    alwaysVisible?: boolean
    showArrows?: boolean
}> = ({
    mesh,
    helper,
    rigidHalfHeight,
    alwaysVisible = false,
    showArrows = true
}) => {
    const { AXIS_ARROWS } = HELPERS
    const { camera, scene } = useSceneContext()!
    const [visible, setVisible] = createSignal(alwaysVisible)
    const parentBoundingBox = new Box3().setFromObject(mesh)
    const parentHeight = parentBoundingBox.max.y - parentBoundingBox.min.y
    const halfHeight = rigidHalfHeight ? rigidHalfHeight : parentHeight / 2

    scene.add(helper)

    let arrowX: ArrowHelper, arrowY: ArrowHelper, arrowZ: ArrowHelper
    let ctrlKeyPressed = false

    const updateArrowsScale = () => {
        const distance = camera().position.distanceTo(mesh.position)
        const scale = distance / 16 // Adjust the divisor to control the scaling effect
        arrowX.setLength(2 * scale, 0.5 * scale, 0.2 * scale)
        arrowY.setLength(2 * scale, 0.5 * scale, 0.2 * scale)
        arrowZ.setLength(2 * scale, 0.5 * scale, 0.2 * scale)
    }

    let hovered = false
    const checkIntersection = (mouse: Vector2) => {
        const raycaster = new Raycaster()
        raycaster.setFromCamera(mouse, camera())
        const intersectsMesh = raycaster.intersectObject(mesh, true)
        const intersectsArrowGroup = raycaster.intersectObject(helper, true)

        const distance = camera().position.distanceTo(mesh.position)
        if (ctrlKeyPressed && intersectsMesh.length > 0 && distance <= 50) {
            setVisible(true)
            hovered = true
        } else if (
            hovered &&
            intersectsArrowGroup.length > 0 &&
            distance <= 50
        ) {
            setVisible(true)
        } else {
            setVisible(false)
            hovered = false
        }

        const arrows = showArrows ? [arrowX, arrowY, arrowZ] : []
        arrows.forEach(arrow => (arrow.visible = visible()))
    }

    onMount(() => {
        const topPosition = new Vector3(0, halfHeight + AXIS_ARROWS.height, 0)

        arrowX = new ArrowHelper(
            new Vector3(1, 0, 0),
            topPosition.clone(),
            2,
            0xff0000
        )
        if (showArrows) helper.add(arrowX)

        arrowY = new ArrowHelper(
            new Vector3(0, 0, 1),
            topPosition.clone(),
            2,
            0x0000ff
        )
        if (showArrows) helper.add(arrowY)

        arrowZ = new ArrowHelper(
            new Vector3(0, 1, 0),
            topPosition.clone(),
            2,
            0x00ff00
        )
        if (showArrows) helper.add(arrowZ)

        const arrows = showArrows ? [arrowX, arrowY, arrowZ] : []

        // Set arrows visibility based on the alwaysVisible prop
        arrows.forEach(arrow => (arrow.visible = alwaysVisible))

        const animate = () => {
            requestAnimationFrame(animate)

            const distance = camera().position.distanceTo(mesh.position)
            if ((hovered || alwaysVisible) && distance <= 50) {
                updateArrowsScale()
                helper.position.copy(mesh.position)
            }
        }
        animate()

        if (!alwaysVisible) {
            // Raycaster setup for mouse hover detection
            const mouse = new Vector2()

            const onMouseMove = (event: MouseEvent) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
                checkIntersection(mouse)
            }

            const onKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Control') {
                    ctrlKeyPressed = true
                    checkIntersection(mouse)
                }
            }

            const onKeyUp = (event: KeyboardEvent) => {
                if (event.key === 'Control') {
                    ctrlKeyPressed = false
                    hovered = false
                    setVisible(false)
                    arrows.forEach(arrow => (arrow.visible = visible()))
                }
            }

            window.addEventListener('mousemove', onMouseMove)
            window.addEventListener('keydown', onKeyDown)
            window.addEventListener('keyup', onKeyUp)

            onCleanup(() => {
                window.removeEventListener('mousemove', onMouseMove)
                window.removeEventListener('keydown', onKeyDown)
                window.removeEventListener('keyup', onKeyUp)
            })
        }

        onCleanup(() => {
            if (showArrows) {
                helper.remove(arrowX)
                helper.remove(arrowY)
                helper.remove(arrowZ)
            }
            scene.remove(helper)
        })
    })

    return null
}

export default AxisArrows
