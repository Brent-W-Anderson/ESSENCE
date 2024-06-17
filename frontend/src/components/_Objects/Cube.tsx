import { Component, onMount } from 'solid-js'
import * as THREE from 'three'
import AxisArrows from '../_Helpers/AxisArrows'
import { useSceneContext } from '@/components/_Scene/SceneContext'

const Cube: Component<{
    index: number
    scale: { h: number; w: number; d: number }
    initialPosition: { x: number; y: number; z: number }
}> = ({ index, scale, initialPosition }) => {
    const context = useSceneContext()
    if (!context) return null

    const { scene, physicsWorld, createRigidBody, setObjectsRef } = context
    const geometry = new THREE.BoxGeometry(scale.w, scale.h, scale.d)
    const material = new THREE.MeshStandardMaterial({ color: 0x0000cc })
    const cube = new THREE.Mesh(geometry, material)

    onMount(() => {
        cube.receiveShadow = true
        cube.castShadow = true
        cube.position.set(
            initialPosition.x,
            initialPosition.y + scale.h / 2,
            initialPosition.z
        )

        setObjectsRef!((prev: { index: number; mesh: THREE.Mesh }[]) => [
            ...prev,
            { index, mesh: cube }
        ])

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

    return <AxisArrows mesh={cube} />
}

export default Cube
