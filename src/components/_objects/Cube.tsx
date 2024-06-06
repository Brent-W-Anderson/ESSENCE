import { Component, onMount } from 'solid-js'
import * as THREE from 'three'
import { useSceneContext } from '../_Scene/SceneContext'

const Cube: Component<{
    height: number
    width: number
    depth: number
    initialPosition: { x: number; y: number; z: number }
}> = ({ height, width, depth, initialPosition }) => {
    const context = useSceneContext()
    if (!context) return null

    const { scene, physicsWorld, createRigidBody, updateMesh, AmmoLib } =
        context
    const ammo = AmmoLib()
    let cube: THREE.Mesh | null = null

    onMount(() => {
        const geometry = new THREE.BoxGeometry(width, height, depth)
        const material = new THREE.MeshStandardMaterial({ color: 0x0000cc })

        cube = new THREE.Mesh(geometry, material)
        cube.receiveShadow = true
        cube.castShadow = true
        cube.position.set(
            initialPosition.x,
            initialPosition.y + height / 2,
            initialPosition.z
        )

        scene.add(cube)

        const rigid = createRigidBody(cube, 0, {
            width: width / 2,
            height: height / 2,
            depth: depth / 2
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
