import { Component, onCleanup, onMount } from 'solid-js'
import * as THREE from 'three'

const coordHeight = 2
const arrowHeight = 0.5
const font = 'Bold 24px Arial'
const fontColor = 'black'
const showAxisArrows = false

const AxisArrows: Component<{
    mesh?: THREE.Object3D
    rigidHalfHeight?: number
}> = ({ mesh, rigidHalfHeight }) => {
    if (!mesh || !showAxisArrows) return null

    const parentBoundingBox = new THREE.Box3().setFromObject(mesh)
    const parentHeight = parentBoundingBox.max.y - parentBoundingBox.min.y
    const halfHeight = rigidHalfHeight ? rigidHalfHeight : parentHeight / 2
    let sprite: THREE.Sprite

    const updateTextSprite = () => {
        const text = `x: ${mesh.position.x.toFixed(1)}, y: ${Math.abs(mesh.position.y - halfHeight).toFixed(1)}, z: ${mesh.position.z.toFixed(1)}`
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        canvas.width = 400
        canvas.height = 100
        context!.font = font
        context!.fillStyle = 'rgba(255,255,255,1.0)'
        context!.lineWidth = 4
        context!.strokeStyle = fontColor

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
            mesh.add(sprite)
        }
    }

    const createTextSprite = (text: string) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        canvas.width = 400
        canvas.height = 100
        context!.font = font
        context!.fillStyle = 'rgba(255,255,255,1.0)'
        context!.lineWidth = 4
        context!.strokeStyle = fontColor

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
        mesh.add(arrowX)

        const arrowY = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            topPosition.clone(),
            2,
            0x0000ff
        )
        mesh.add(arrowY)

        const arrowZ = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            topPosition.clone(),
            2,
            0x00ff00
        )
        mesh.add(arrowZ)

        sprite = createTextSprite(
            `x: ${mesh.position.x.toFixed(1)}, y: ${Math.abs(mesh.position.y - halfHeight).toFixed(1)}, z: ${mesh.position.z.toFixed(1)}`
        )
        sprite.position.copy(
            topPosition.clone().add(new THREE.Vector3(0, coordHeight, 0))
        )
        mesh.add(sprite)

        const animate = () => {
            requestAnimationFrame(animate)
            updateTextSprite()
        }
        animate()

        onCleanup(() => {
            mesh.remove(arrowX)
            mesh.remove(arrowY)
            mesh.remove(arrowZ)
            mesh.remove(sprite)
        })
    })

    return null
}

export default AxisArrows
