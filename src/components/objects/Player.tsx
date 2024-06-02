import * as Ammo from 'ammojs3'
import { Component, onMount } from 'solid-js'
import * as THREE from 'three'
import AxisArrows from '../helpers/AxisArrows'
import { useSceneContext } from '../scene/SceneContext'

const Player: Component<{
    setPlayerRef: (player: THREE.Group | THREE.Mesh) => void
    setRigidPlayerRef: (rigidBody: Ammo.default.btRigidBody) => void
    useGravity?: boolean
    initialPosition?: { x: number; y: number; z: number }
}> = ({
    setPlayerRef,
    setRigidPlayerRef,
    useGravity = false,
    initialPosition = { x: 0, y: 0, z: 0 }
}) => {
    const context = useSceneContext()
    if (!context) return

    const { scene, physicsWorld, createRigidBody, updateMesh } = context
    const group = new THREE.Group()

    onMount(() => {
        const geometry = new THREE.SphereGeometry(1, 40, 40)
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
        const player = new THREE.Mesh(geometry, material)

        player.castShadow = true
        player.receiveShadow = true

        // Set the initial position
        group.position.set(
            initialPosition.x,
            initialPosition.y,
            initialPosition.z
        )

        group.add(player)
        scene.add(group)

        const rigidBody = createRigidBody(group, 1, {
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
        }
    })

    return <AxisArrows parent={group} />
}

export default Player
