import { Component, onMount } from 'solid-js'
import * as THREE from 'three'
import { useSceneContext } from '../_Scene/SceneContext'

const Cube: Component<{
    index: number
    scale: { h: number; w: number; d: number }
    initialPosition: { x: number; y: number; z: number }
    addObjectsRef: (index: number, mesh: THREE.Mesh) => void
}> = ({ index, scale, initialPosition, addObjectsRef }) => {
    const context = useSceneContext()
    if (!context) return null

    const { scene, physicsWorld, createRigidBody } = context
    let cube: THREE.Mesh | null = null

    onMount(() => {
        const geometry = new THREE.BoxGeometry(scale.w, scale.h, scale.d)
        const material = new THREE.MeshStandardMaterial({ color: 0x0000cc })

        cube = new THREE.Mesh(geometry, material)
        cube.receiveShadow = true
        cube.castShadow = true
        cube.position.set(
            initialPosition.x,
            initialPosition.y + scale.h / 2,
            initialPosition.z
        )

        addObjectsRef(index, cube)

        scene.add(cube)

        const rigid = createRigidBody(cube, 0, {
            width: scale.w / 2,
            height: scale.h / 2,
            depth: scale.d / 2
        })
        rigid && physicsWorld && physicsWorld()?.addRigidBody(rigid)

        return () => {
            if (cube) {
                scene.remove(cube)
                rigid && physicsWorld && physicsWorld()?.removeRigidBody(rigid)
            }
        }
    })

    return null
}

export default Cube
