import { Component, onCleanup, onMount } from 'solid-js'
import {
    Sprite,
    SpriteMaterial,
    Texture,
    Object3D,
    Raycaster,
    Vector2,
    Box3,
    Group
} from 'three'
import { useSceneContext } from '@/components/_Scene/Context'
import { HELPERS } from '@/config'

// TODO: add functionality for ctrl + hover & left-click to lock the coordinates visibility = true.
// this should still only stay visible under a distance of <= 50.

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
    let ctrlKeyPressed = false

    const parentBoundingBox = new Box3().setFromObject(mesh)
    const parentHeight = parentBoundingBox.max.y - parentBoundingBox.min.y
    const halfHeight = rigidHalfHeight ? rigidHalfHeight : parentHeight / 2

    const createOrUpdateTextSprite = (text: string, sprite?: Sprite) => {
        const padding = 10

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!

        const distance = camera().position.distanceTo(mesh.position)
        const fontSize = COORDINATES.fontSize * (distance / 16) // Adjust the divisor to control the scaling effect
        const font = `${COORDINATES.fontWeight} ${fontSize}px ${COORDINATES.font}`
        context.font = font

        const textMetrics = context.measureText(text)
        const textWidth = textMetrics.width
        const textHeight =
            textMetrics.actualBoundingBoxAscent +
            textMetrics.actualBoundingBoxDescent

        // Set canvas dimensions based on text size and font size
        canvas.width = Math.ceil(textWidth + padding * 2)
        canvas.height = Math.ceil(textHeight + padding * 2)

        // Set font styles again after changing canvas dimensions
        context.font = font
        context.fillStyle = COORDINATES.fontColor
        context.lineWidth = 4
        context.strokeStyle = COORDINATES.fontStrokeColor

        const xPosition = padding
        const yPosition = textMetrics.actualBoundingBoxAscent + padding

        context.strokeText(text, xPosition, yPosition)
        context.fillText(text, xPosition, yPosition)

        const texture = new Texture(canvas)
        texture.needsUpdate = true

        if (sprite) {
            sprite.material.map?.dispose()
            sprite.material.map = texture
            sprite.scale.set(
                canvas.width / COORDINATES.fontQuality,
                canvas.height / COORDINATES.fontQuality,
                1
            ) // Adjust scale based on your requirements
        } else {
            const spriteMaterial = new SpriteMaterial({ map: texture })
            const newSprite = new Sprite(spriteMaterial)
            newSprite.scale.set(
                canvas.width / COORDINATES.fontQuality,
                canvas.height / COORDINATES.fontQuality,
                1
            ) // Adjust scale based on your requirements

            return newSprite
        }
    }

    onMount(() => {
        scene.add(helper)

        const initialText = `x: ${mesh.position.x.toFixed(1)}, y: ${Math.abs(mesh.position.y - halfHeight).toFixed(1)}, z: ${mesh.position.z.toFixed(1)}`
        let hovered = false

        sprite = createOrUpdateTextSprite(initialText) as Sprite
        helper.add(sprite)
        sprite.visible = alwaysVisible

        const updateSpritePosition = () => {
            const distance = camera().position.distanceTo(mesh.position)
            const scaledHeight = arrows
                ? COORDINATES.height * (distance < 4 ? 1 : distance / 4)
                : COORDINATES.height
            sprite.position.set(
                0,
                halfHeight + scaledHeight + (arrows ? 1 : 0.2),
                0
            )
        }

        const animate = () => {
            requestAnimationFrame(animate)

            const distance = camera().position.distanceTo(mesh.position)
            if ((hovered || alwaysVisible) && distance <= 50) {
                const updatedText = `x: ${mesh.position.x.toFixed(1)}, y: ${Math.abs(mesh.position.y - halfHeight).toFixed(1)}, z: ${mesh.position.z.toFixed(1)}`
                createOrUpdateTextSprite(updatedText, sprite)
                updateSpritePosition()
                helper.position.copy(mesh.position)
            } else {
                sprite.visible = false
            }
        }
        animate()

        if (!alwaysVisible) {
            // Raycaster setup for mouse hover detection
            const raycaster = new Raycaster()
            const mouse = new Vector2()

            const checkIntersection = () => {
                raycaster.setFromCamera(mouse, camera())
                const intersectsMesh = raycaster.intersectObject(mesh, true)
                const intersectsCoordinatesGroup = raycaster.intersectObject(
                    helper,
                    true
                )

                if (ctrlKeyPressed && intersectsMesh.length > 0) {
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

            const onMouseMove = (event: MouseEvent) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
                checkIntersection()
            }

            const onKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Control') {
                    ctrlKeyPressed = true
                    checkIntersection()
                }
            }

            const onKeyUp = (event: KeyboardEvent) => {
                if (event.key === 'Control') {
                    ctrlKeyPressed = false
                    hovered = false
                    visible = false
                    sprite.visible = false
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
            helper.remove(sprite)
            scene.remove(helper)
        })
    })

    return null
}

export default Coordinates
