import { Component, onMount } from 'solid-js'
import * as THREE from 'three'
import AxisArrows from '../helpers/AxisArrows'
import positionController from '../helpers/PositionController'
import { useSceneContext } from '../scene/SceneContext'

type CubeProps = {
    onCubeCreated: (cube: THREE.Group) => void
    useGravity?: boolean
}

const Cube: Component<CubeProps> = ({ onCubeCreated, useGravity = false }) => {
    const context = useSceneContext()
    if (!context) return

    const { scene, physicsWorld, createRigidBody, updateMesh } = context
    const group = new THREE.Group()

    onMount(() => {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
        const cube = new THREE.Mesh(geometry, material)

        cube.castShadow = true
        cube.receiveShadow = true

        group.add(cube)
        scene.add(group)
        positionController.addObject('cube', group)

        const rigid = createRigidBody(group, 0.01)
        if (useGravity) {
            rigid && physicsWorld && physicsWorld()?.addRigidBody(rigid)
            updateMesh(group, rigid)
        }

        onCubeCreated(group)

        return () => {
            scene.remove(group)
            rigid &&
                physicsWorld &&
                useGravity &&
                physicsWorld()?.removeRigidBody(rigid)
            positionController.removeObject('cube')
        }
    })

    return <AxisArrows parent={group} />
}

export default Cube
