import { Component, onMount } from 'solid-js'
import * as THREE from 'three'
import AxisArrows from '@/components/_Helpers/AxisArrows'
import { useSceneContext } from '@/components/_Scene/SceneContext'

const Player: Component<{
    initialPosition?: { x: number; y: number; z: number }
}> = ({ initialPosition = { x: 0, y: 0, z: 0 } }) => {
    const context = useSceneContext()
    if (!context) return null

    const {
        scene,
        physicsWorld,
        createRigidBody,
        updateMesh,
        AmmoLib,
        setPlayerRef,
        setRigidPlayerRef
    } = context
    const ammo = AmmoLib()
    const group = new THREE.Group()

    onMount(() => {
        const radius = 1
        const height = 4
        const geometry = new THREE.CapsuleGeometry(radius, height, 40, 40)
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

        const calculateAmmoHeight = (height: number) => {
            if (height <= 1) {
                return height + 0.5
            } else if (height <= 2) {
                return height
            } else {
                return 2 + (height - 2) * 0.5
            }
        }

        const ammoHeight = calculateAmmoHeight(height)
        const rigidBody = createRigidBody(group, 1, {
            width: radius,
            height: ammoHeight,
            depth: radius
        })

        rigidBody && physicsWorld && physicsWorld()?.addRigidBody(rigidBody)
        rigidBody.setAngularFactor(new ammo.btVector3(0, 0, 0))
        rigidBody.setRestitution(1)
        rigidBody.setFriction(1)

        updateMesh(group, rigidBody)
        setRigidPlayerRef!(rigidBody)
        setPlayerRef!(group)

        return () => {
            scene.remove(group)
            rigidBody &&
                physicsWorld &&
                physicsWorld()?.removeRigidBody(rigidBody)
        }
    })

    return (
        <AxisArrows
            mesh={group}
            rigidHalfHeight={3}
            alwaysVisible
            showArrows={false}
        />
    )
}

export default Player
