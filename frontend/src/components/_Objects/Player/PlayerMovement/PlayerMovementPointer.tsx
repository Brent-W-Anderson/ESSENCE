import { Component, createEffect, onCleanup } from 'solid-js'
import * as THREE from 'three'

const ringColor = 0x00ff00
const ringThickness = 0.05
const outerRadius = 0.4
const segments = 32

const PlayerMovementPointer: Component<{
    scene: THREE.Scene
    onPointerCreated: (object: THREE.Mesh) => void
}> = ({ scene, onPointerCreated }) => {
    const pointerGeometry = new THREE.RingGeometry(
        outerRadius - ringThickness,
        outerRadius,
        segments
    )
    const pointerMaterial = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 1
    })
    const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial)
    pointer.rotation.x = -Math.PI / 2
    pointer.visible = false

    let scale = 1
    let opacity = 1
    let growing = true
    let animationFrameId: number

    const animatePointer = () => {
        if (growing) {
            scale += 0.02
            opacity -= 0.02
            if (scale >= 2) {
                growing = false
            }
        } else {
            scale = 1
            opacity = 1
            growing = true
        }

        pointer.scale.set(scale, scale, scale)
        pointer.material.opacity = opacity

        animationFrameId = requestAnimationFrame(animatePointer)
    }

    createEffect(() => {
        scene.add(pointer)
        onPointerCreated(pointer)

        // Start the animation loop
        animatePointer()

        onCleanup(() => {
            scene.remove(pointer)
            cancelAnimationFrame(animationFrameId)
        })
    })

    return null
}

export default PlayerMovementPointer
