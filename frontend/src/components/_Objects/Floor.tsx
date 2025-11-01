import { Component, onCleanup, onMount } from 'solid-js'
import { BoxGeometry, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three'
import { useSceneContext } from '@/components/_Scene/Context'

const Floor: Component = () => {
    const { scene, physicsWorld, createRigidBody, setFloorRef }
        = useSceneContext()!
    let floor: Mesh | null = null

    onMount( () => {
        const floorGeometry = new PlaneGeometry( 100, 100 )
        const floorMaterial = new MeshStandardMaterial( {
            color: 0x00ffff
        } )

        floor = new Mesh( floorGeometry, floorMaterial )
        floor.rotation.x = -Math.PI / 2
        floor.receiveShadow = true

        scene.add( floor )

        setFloorRef?.( floor )

        const rigid = createRigidBody( floor, 0, {
            width: 50,
            height: 50,
            depth: 0
        } )
        const world = physicsWorld?.()

        if ( rigid && world ) {
            world.addRigidBody( rigid )
        }

        const createWall = (
            width: number,
            height: number,
            depth: number,
            x: number,
            y: number,
            z: number
        ) => {
            const wallGeometry = new BoxGeometry( width, height, depth )
            const wallMaterial = new MeshStandardMaterial( {
                color: 0x00aaff
            } )

            const wall = new Mesh( wallGeometry, wallMaterial )
            wall.position.set( x, y, z )
            wall.receiveShadow = true
            wall.castShadow = true
            scene.add( wall )

            const wallRigid = createRigidBody( wall, 0, {
                width: width / 2,
                height: height / 2,
                depth: depth / 2
            } )

            return {
                wall,
                wallRigid
            }
        }

        const wallHeight = 2
        const wallThickness = 1
        const halfSize = 50 - wallThickness / 2

        const walls = [
            createWall(
                100,
                wallHeight,
                wallThickness,
                0,
                wallHeight / 2,
                halfSize
            ), // Front wall
            createWall(
                100,
                wallHeight,
                wallThickness,
                0,
                wallHeight / 2,
                -halfSize
            ), // Back wall
            createWall(
                wallThickness,
                wallHeight,
                100,
                halfSize,
                wallHeight / 2,
                0
            ), // Right wall
            createWall(
                wallThickness,
                wallHeight,
                100,
                -halfSize,
                wallHeight / 2,
                0
            ) // Left wall
        ]

        onCleanup( () => {
            // floor
            if ( floor ) {
                scene.remove( floor )
                floorGeometry.dispose()
                floorMaterial.dispose()
                rigid.dispose()
            }

            // walls
            walls.forEach( wall => {
                scene.remove( wall.wall )
                wall.wall.geometry.dispose()
                wall.wall.material.dispose()
                wall.wallRigid.dispose()
            } )
        } )
    } )

    return null
}

export default Floor