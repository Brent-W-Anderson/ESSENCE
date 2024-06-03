import { Component, createEffect } from 'solid-js'
import * as THREE from 'three'

interface PointerProps {
    scene: THREE.Scene
    onPointerCreated: (object: THREE.Mesh) => void
}

const PlayerMovementPointer: Component<PointerProps> = ({
    scene,
    onPointerCreated
}) => {
    const height = 6
    const pointerGeometry = new THREE.CylinderGeometry(0.05, 0.05, height, 32)
    pointerGeometry.translate(0, height / 2, 0)
    const pointerMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.7
    })
    const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial)

    createEffect(() => {
        scene.add(pointer)
        onPointerCreated(pointer)

        return () => {
            scene.remove(pointer)
        }
    })

    return null
}

export default PlayerMovementPointer
