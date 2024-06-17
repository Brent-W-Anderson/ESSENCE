import { Component, createSignal, onCleanup, onMount } from 'solid-js'
import * as THREE from 'three'
import { useSceneContext } from '../_Scene/SceneContext'

const coordHeight = 0
const arrowHeight = 0.5
const font = 'Bold 24px Arial'
const fontColor = 'rgba(255,255,255,1.0)'
const fontStrokeColor = 'black'
const showAxisArrows = true

const AxisArrows: Component<{
    mesh?: THREE.Object3D
    rigidHalfHeight?: number
    alwaysVisible?: boolean
    showArrows?: boolean
    showCoordinates?: boolean
}> = ({
    mesh,
    rigidHalfHeight,
    alwaysVisible = false,
    showArrows = true,
    showCoordinates = true
}) => {
    const context = useSceneContext()
    if (!context || !mesh || !showAxisArrows) return null

    const { camera, scene } = context

    const [visible, setVisible] = createSignal(alwaysVisible)
    const parentBoundingBox = new THREE.Box3().setFromObject(mesh)
    const parentHeight = parentBoundingBox.max.y - parentBoundingBox.min.y
    const halfHeight = rigidHalfHeight ? rigidHalfHeight : parentHeight / 2
    const arrowGroup = new THREE.Group()
    scene.add(arrowGroup)
    let sprite: THREE.Sprite

    const updateTextSprite = () => {
        if (!showCoordinates) return
        const text = `x: ${mesh.position.x.toFixed(1)}, y: ${Math.abs(mesh.position.y - halfHeight).toFixed(1)}, z: ${mesh.position.z.toFixed(1)}`
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        canvas.width = 400
        canvas.height = 100
        context!.font = font
        context!.fillStyle = fontColor
        context!.lineWidth = 4
        context!.strokeStyle = fontStrokeColor

        const textWidth = context!.measureText(text).width
        const xPosition = (canvas.width - textWidth) / 2
        context!.strokeText(text, xPosition, 40)
        context!.fillText(text, xPosition, 40)

        const texture = new THREE.Texture(canvas)
        texture.needsUpdate = true

        if (sprite) {
            sprite.material.map?.dispose()
            sprite.material.map = texture
        } else {
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
            sprite = new THREE.Sprite(spriteMaterial)
            sprite.scale.set(6, 2, 1)
            arrowGroup.add(sprite)
        }
    }

    const createTextSprite = (text: string) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        canvas.width = 400
        canvas.height = 100
        context!.font = font
        context!.fillStyle = fontColor
        context!.lineWidth = 4
        context!.strokeStyle = fontStrokeColor

        const textWidth = context!.measureText(text).width
        const xPosition = (canvas.width - textWidth) / 2
        context!.strokeText(text, xPosition, 40)
        context!.fillText(text, xPosition, 40)

        const texture = new THREE.Texture(canvas)
        texture.needsUpdate = true

        const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
        const sprite = new THREE.Sprite(spriteMaterial)
        sprite.scale.set(6, 2, 1)

        return sprite
    }

    onMount(() => {
        const topPosition = new THREE.Vector3(0, halfHeight + arrowHeight, 0)

        const arrowX = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            topPosition.clone(),
            2,
            0xff0000
        )
        if (showArrows) arrowGroup.add(arrowX)

        const arrowY = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            topPosition.clone(),
            2,
            0x0000ff
        )
        if (showArrows) arrowGroup.add(arrowY)

        const arrowZ = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            topPosition.clone(),
            2,
            0x00ff00
        )
        if (showArrows) arrowGroup.add(arrowZ)

        if (showCoordinates) {
            const coordH = showArrows ? coordHeight + 2 : coordHeight

            sprite = createTextSprite(
                `x: ${mesh.position.x.toFixed(1)}, y: ${Math.abs(mesh.position.y - halfHeight).toFixed(1)}, z: ${mesh.position.z.toFixed(1)}`
            )
            sprite.position.copy(
                topPosition.clone().add(new THREE.Vector3(0, coordH, 0))
            )
            arrowGroup.add(sprite)
        }

        const arrows = showArrows ? [arrowX, arrowY, arrowZ] : []

        // Set arrows and coordinates visibility based on the alwaysVisible prop
        arrows.forEach(arrow => (arrow.visible = alwaysVisible))
        if (showCoordinates) sprite.visible = alwaysVisible

        const animate = () => {
            requestAnimationFrame(animate)
            updateTextSprite()
            arrowGroup.position.copy(mesh.position)
        }
        animate()

        if (!alwaysVisible) {
            // Raycaster setup for mouse hover detection
            const raycaster = new THREE.Raycaster()
            const mouse = new THREE.Vector2()
            let hovered = false

            const onMouseMove = (event: MouseEvent) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
                raycaster.setFromCamera(mouse, camera)

                const intersectsMesh = raycaster.intersectObject(mesh, true)
                const intersectsArrowGroup = raycaster.intersectObject(
                    arrowGroup,
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
                if (showCoordinates) sprite.visible = visible()
            }

            window.addEventListener('mousemove', onMouseMove)

            onCleanup(() => {
                window.removeEventListener('mousemove', onMouseMove)
            })
        }

        onCleanup(() => {
            if (showArrows) {
                arrowGroup.remove(arrowX)
                arrowGroup.remove(arrowY)
                arrowGroup.remove(arrowZ)
            }
            if (showCoordinates) {
                arrowGroup.remove(sprite)
            }
            scene.remove(arrowGroup)
        })
    })

    return null
}

export default AxisArrows
