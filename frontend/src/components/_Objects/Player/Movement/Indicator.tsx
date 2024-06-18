import { useSceneContext } from '@/components/_Scene/Context'
import { Component, createEffect, onCleanup } from 'solid-js'
import { Mesh, MeshBasicMaterial, RingGeometry, Scene } from 'three'
import { usePlayerMovementContext } from './Context'
import { PLAYER } from '@/config'

const PlayerMovementIndicator: Component = () => {
    const context = useSceneContext()!
    const movementContext = usePlayerMovementContext()!
    const { ringColor, ringThickness, outerRadius, segments } =
        PLAYER.MOVEMENT.INDICATOR

    const {
        pointer: [, setPointer]
    } = movementContext

    const pointerGeometry = new RingGeometry(
        outerRadius - ringThickness,
        outerRadius,
        segments
    )
    const pointerMaterial = new MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 1
    })
    const pointer = new Mesh(pointerGeometry, pointerMaterial)
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
        context.scene.add(pointer)
        setPointer(pointer)

        // Start the animation loop
        animatePointer()

        onCleanup(() => {
            context.scene.remove(pointer)
            cancelAnimationFrame(animationFrameId)
        })
    })

    return null
}

export default PlayerMovementIndicator
