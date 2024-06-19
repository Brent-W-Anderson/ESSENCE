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

    onMount(() => {
        const topPosition = new Vector3(0, halfHeight + AXIS_ARROWS.height, 0)

        const arrowX = new ArrowHelper(
            new Vector3(1, 0, 0),
            topPosition.clone(),
            2,
            0xff0000
        )
        if (showArrows) helper.add(arrowX)

        const arrowY = new ArrowHelper(
            new Vector3(0, 0, 1),
            topPosition.clone(),
            2,
            0x0000ff
        )
        if (showArrows) helper.add(arrowY)

        const arrowZ = new ArrowHelper(
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
            helper.position.copy(mesh.position)
        }
        animate()

        if (!alwaysVisible) {
            // Raycaster setup for mouse hover detection
            const raycaster = new Raycaster()
            const mouse = new Vector2()
            let hovered = false

            const onMouseMove = (event: MouseEvent) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
                raycaster.setFromCamera(mouse, camera)

                const intersectsMesh = raycaster.intersectObject(mesh, true)
                const intersectsArrowGroup = raycaster.intersectObject(
                    helper,
                    true
                )

                if (intersectsMesh.length > 0) {
                    setVisible(true)
                    hovered = true
                } else if (hovered && intersectsArrowGroup.length > 0) {
                    setVisible(true)
                } else {
                    setVisible(false)
                    hovered = false
                }

                arrows.forEach(arrow => (arrow.visible = visible()))
            }

            window.addEventListener('mousemove', onMouseMove)

            onCleanup(() => {
                window.removeEventListener('mousemove', onMouseMove)
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
