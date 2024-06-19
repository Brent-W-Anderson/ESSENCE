import { Component, onCleanup, onMount } from 'solid-js'
import {
    Sprite,
    SpriteMaterial,
    Texture,
    Vector3,
    Object3D,
    Raycaster,
    Vector2,
    Box3,
    Group
} from 'three'
import { useSceneContext } from '@/components/_Scene/Context'
import { HELPERS } from '@/config'

const Coordinates: Component<{
    mesh: Object3D
    helper: Group
    rigidHalfHeight?: number
    alwaysVisible?: boolean
    showCoordinates?: boolean
    arrows?: boolean
}> = ({
    mesh,
    helper,
    rigidHalfHeight,
    alwaysVisible = false,
    showCoordinates = true,
    arrows = true
}) => {
    if (!showCoordinates) return null

    const { COORDINATES } = HELPERS
    const { camera, scene } = useSceneContext()!
    let visible = alwaysVisible
    let sprite: Sprite

    const parentBoundingBox = new Box3().setFromObject(mesh)
    const parentHeight = parentBoundingBox.max.y - parentBoundingBox.min.y
    const halfHeight = rigidHalfHeight ? rigidHalfHeight : parentHeight / 2

    const createTextSprite = (text: string) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!

        canvas.width = 400
        canvas.height = 100
        context.font = COORDINATES.font
        context.fillStyle = COORDINATES.fontColor
        context.lineWidth = 4
        context.strokeStyle = COORDINATES.fontStrokeColor

        const textWidth = context.measureText(text).width
        const xPosition = (canvas.width - textWidth) / 2
        context.strokeText(text, xPosition, 40)
        context.fillText(text, xPosition, 40)

        const texture = new Texture(canvas)
        texture.needsUpdate = true

        const spriteMaterial = new SpriteMaterial({ map: texture })
        const sprite = new Sprite(spriteMaterial)
        sprite.scale.set(6, 2, 1)

        return sprite
    }

    const updateTextSprite = () => {
        const text = `x: ${mesh.position.x.toFixed(1)}, y: ${Math.abs(mesh.position.y - halfHeight).toFixed(1)}, z: ${mesh.position.z.toFixed(1)}`
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!

        canvas.width = 400
        canvas.height = 100
        context.font = COORDINATES.font
        context.fillStyle = COORDINATES.fontColor
        context.lineWidth = 4
        context.strokeStyle = COORDINATES.fontStrokeColor

        const textWidth = context.measureText(text).width
        const xPosition = (canvas.width - textWidth) / 2
        context.strokeText(text, xPosition, 40)
        context.fillText(text, xPosition, 40)

        const texture = new Texture(canvas)
        texture.needsUpdate = true

        if (sprite) {
            sprite.material.map?.dispose()
            sprite.material.map = texture
        }
    }

    onMount(() => {
        scene.add(helper)

        sprite = createTextSprite(
            `x: ${mesh.position.x.toFixed(1)}, y: ${Math.abs(mesh.position.y - halfHeight).toFixed(1)}, z: ${mesh.position.z.toFixed(1)}`
        )
        sprite.position.copy(
            new Vector3(
                0,
                halfHeight + COORDINATES.height + (arrows ? 2 : 0),
                0
            )
        )
        helper.add(sprite)
        sprite.visible = alwaysVisible

        const animate = () => {
            requestAnimationFrame(animate)
            updateTextSprite()
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
                const intersectsCoordinatesGroup = raycaster.intersectObject(
                    helper,
                    true
                )

                if (intersectsMesh.length > 0) {
                    visible = true
                    hovered = true
                } else if (hovered && intersectsCoordinatesGroup.length > 0) {
                    visible = true
                } else {
                    visible = false
                    hovered = false
                }

                sprite.visible = visible
            }

            window.addEventListener('mousemove', onMouseMove)

            onCleanup(() => {
                window.removeEventListener('mousemove', onMouseMove)
            })
        }

        onCleanup(() => {
            helper.remove(sprite)
            scene.remove(helper)
        })
    })

    return null
}

export default Coordinates
