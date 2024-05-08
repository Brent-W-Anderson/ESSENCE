import { Component, createEffect } from 'solid-js'
import * as THREE from 'three'

interface PointerProps {
    scene: THREE.Scene
    onPointerCreated: (object: THREE.Object3D) => void
}

const PlayerMovementPointer: Component<PointerProps> = ({
    scene,
    onPointerCreated
}) => {
    const pointerGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 32)
    const pointerMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.7
    })
    const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial)

    pointer.rotation.y = Math.PI / 2
    pointer.visible = false

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
