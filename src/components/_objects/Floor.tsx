import { Component, onMount } from 'solid-js'
import * as THREE from 'three'
import { useSceneContext } from '../_Scene/SceneContext'

const Floor: Component<{
    onFloorCreated: (floor: THREE.Mesh) => void
}> = ({ onFloorCreated }) => {
    const context = useSceneContext()
    if (!context) return

    const { scene, physicsWorld, createRigidBody } = context
    let floor: THREE.Mesh | null = null

    onMount(() => {
        const floorGeometry = new THREE.PlaneGeometry(40, 40)
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc
        })

        floor = new THREE.Mesh(floorGeometry, floorMaterial)
        floor.rotation.x = -Math.PI / 2
        floor.receiveShadow = true

        scene.add(floor)

        onFloorCreated(floor)

        const rigid = createRigidBody(floor, 0, {
            width: 20,
            height: 20,
            depth: 0
        })
        rigid && physicsWorld && physicsWorld()?.addRigidBody(rigid)

        return () => {
            if (floor) {
                scene.remove(floor)
                rigid && physicsWorld && physicsWorld()?.removeRigidBody(rigid)
            }
        }
    })

    return null
}

export default Floor
