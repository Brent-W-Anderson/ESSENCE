import { Component, onMount } from 'solid-js'
import { BoxGeometry, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three'
import { useSceneContext } from '@/components/_Scene/Context'

const Floor: Component = () => {
    const { scene, physicsWorld, createRigidBody, setFloorRef } =
        useSceneContext()!
    let floor: Mesh | null = null

    onMount(() => {
        const floorGeometry = new PlaneGeometry(1000, 1000)
        const floorMaterial = new MeshStandardMaterial({
            color: 0xcccccc
        })

        floor = new Mesh(floorGeometry, floorMaterial)
        floor.rotation.x = -Math.PI / 2
        floor.receiveShadow = true

        scene.add(floor)

        setFloorRef?.(floor)

        const rigid = createRigidBody(floor, 0, {
            width: 500,
            height: 500,
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
            const wallGeometry = new BoxGeometry(width, height, depth)
            const wallMaterial = new MeshStandardMaterial({
                color: 0x333333
            })

            const wall = new Mesh(wallGeometry, wallMaterial)
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
        const halfSize = 500 - wallThickness / 2

        const walls = [
            createWall(
                1000,
                wallHeight,
                wallThickness,
                0,
                wallHeight / 2,
                halfSize
            ), // Front wall
            createWall(
                1000,
                wallHeight,
                wallThickness,
                0,
                wallHeight / 2,
                -halfSize
            ), // Back wall
            createWall(
                wallThickness,
                wallHeight,
                1000,
                halfSize,
                wallHeight / 2,
                0
            ), // Right wall
            createWall(
                wallThickness,
                wallHeight,
                1000,
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

    return null
}

export default Floor
