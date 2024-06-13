import { Component, JSX, onMount } from 'solid-js'
import * as THREE from 'three'
import { useSceneContext } from '../_Scene/SceneContext'

const Floor: Component<{ children: JSX.Element | JSX.Element[] }> = props => {
    const context = useSceneContext()
    if (!context) return null

    const { scene, physicsWorld, createRigidBody, floorRef, setFloorRef } =
        context

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

        setFloorRef?.(floor)

        const rigid = createRigidBody(floor, 0, {
            width: 20,
            height: 20,
            depth: 0
        })
        rigid && physicsWorld && physicsWorld()?.addRigidBody(rigid)

        const createWall = (
            width: number,
            height: number,
            depth: number,
            x: number,
            y: number,
            z: number
        ) => {
            const wallGeometry = new THREE.BoxGeometry(width, height, depth)
            const wallMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333
            })

            const wall = new THREE.Mesh(wallGeometry, wallMaterial)
            wall.position.set(x, y, z)
            wall.receiveShadow = true
            wall.castShadow = true
            scene.add(wall)

            const wallRigid = createRigidBody(wall, 0, {
                width: width / 2,
                height: height / 2,
                depth: depth / 2
            })
            wallRigid && physicsWorld && physicsWorld()?.addRigidBody(wallRigid)

            return wall
        }

        const wallHeight = 2
        const wallThickness = 1
        const halfSize = 19.5 // Half the size of your floor plane

        const walls = [
            createWall(
                40,
                wallHeight,
                wallThickness,
                0,
                wallHeight / 2,
                halfSize
            ), // Front wall
            createWall(
                40,
                wallHeight,
                wallThickness,
                0,
                wallHeight / 2,
                -halfSize
            ), // Back wall
            createWall(
                wallThickness,
                wallHeight,
                40,
                halfSize,
                wallHeight / 2,
                0
            ), // Right wall
            createWall(
                wallThickness,
                wallHeight,
                40,
                -halfSize,
                wallHeight / 2,
                0
            ) // Left wall
        ]

        return () => {
            if (floor) {
                scene.remove(floor)
                rigid && physicsWorld && physicsWorld()?.removeRigidBody(rigid)
            }
            walls.forEach(wall => {
                scene.remove(wall)
                const wallRigid = wall.userData.physicsBody
                wallRigid &&
                    physicsWorld &&
                    physicsWorld()?.removeRigidBody(wallRigid)
            })
        }
    })

    return <>{floorRef!() && props.children}</>
}

export default Floor
