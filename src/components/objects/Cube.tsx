import { Component, onMount } from 'solid-js'
import * as THREE from 'three'
import AxisArrows from '../helpers/AxisArrows'
import positionController from '../helpers/PositionController'
import { useSceneContext } from '../scene/SceneContext'
import * as Ammo from 'ammojs3'

type CubeProps = {
    setPlayerRef: (cube: THREE.Group | THREE.Mesh) => void
    setRigidPlayerRef: (rigidBody: Ammo.default.btRigidBody) => void
    useGravity?: boolean
}

const Cube: Component<CubeProps> = ({
    setPlayerRef,
    setRigidPlayerRef,
    useGravity = false
}) => {
    const context = useSceneContext()
    if (!context) return

    const { scene, physicsWorld, createRigidBody, updateMesh } = context
    const group = new THREE.Group()

    onMount(() => {
        const geometry = new THREE.SphereGeometry(1, 20, 20)
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
        const cube = new THREE.Mesh(geometry, material)

        cube.castShadow = true
        cube.receiveShadow = true

        group.add(cube)
        scene.add(group)
        positionController.addObject('cube', group)

        const rigidBody = createRigidBody(cube, 10, {
            width: 1,
            height: 1,
            depth: 1
        })
        if (useGravity) {
            rigidBody && physicsWorld && physicsWorld()?.addRigidBody(rigidBody)
            updateMesh(group, rigidBody)
        }

        setRigidPlayerRef(rigidBody)
        setPlayerRef(group)

        return () => {
            scene.remove(group)
            rigidBody &&
                physicsWorld &&
                useGravity &&
                physicsWorld()?.removeRigidBody(rigidBody)
            positionController.removeObject('cube')
        }
    })

    return <AxisArrows parent={group} />
}

export default Cube
