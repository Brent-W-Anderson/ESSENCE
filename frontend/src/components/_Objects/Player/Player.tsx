import { Component, onCleanup, onMount } from 'solid-js'
import {
    CapsuleGeometry,
    Group,
    Mesh,
    MeshStandardMaterial
} from 'three'
import Coordinates from '../Helpers/Coordinates'
import { useSceneContext } from '@/components/_Scene/Context'

const Player: Component<{
    initialPosition?: { x: number; y: number; z: number }
}> = ( {
    initialPosition = {
        x: 0,
        y: 0,
        z: 0
    }
} ) => {
    const {
        scene,
        createRigidBody,
        updateMesh,
        AmmoLib,
        setPlayerRef,
        setRigidPlayerRef
    } = useSceneContext()!

    const group = new Group()

    onMount( () => {
        const radius = 1
        const height = 4

        const geometry = new CapsuleGeometry( radius, height, 40, 40 )
        const material = new MeshStandardMaterial( { color: 0x7700ff } )
        const player = new Mesh( geometry, material )

        player.castShadow = true
        player.receiveShadow = true

        group.position.set(
            initialPosition.x,
            initialPosition.y,
            initialPosition.z
        )

        group.add( player )
        scene.add( group )

        const calcAmmoHeight = ( h: number ) => {
            if ( h <= 1 ) return h + 0.5
            else if ( h <= 2 ) return h
            else return 2 + ( h - 2 ) * 0.5
        }

        const ammoHeight = calcAmmoHeight( height )
        const rigid = createRigidBody( group, 1, {
            width: radius,
            height: ammoHeight,
            depth: radius
        } )
        const body = rigid.body

        const ammo = AmmoLib()
        if ( ammo && body ) {
            const zero = new ammo.btVector3( 0, 0, 0 )
            body.setAngularFactor( zero )
            body.setRestitution( 1 )
            body.setFriction( 1 )
            ammo.destroy( zero )
        }

        if ( body ) {
            updateMesh( group, body )
            setRigidPlayerRef!( body )
        }

        setPlayerRef!( group )

        onCleanup( () => {
            scene.remove( group )

            rigid.dispose()
            geometry.dispose()
            material.dispose()
        } )
    } )

    const helperGroup = new Group()

    return (
        <Coordinates
            mesh={group}
            helper={helperGroup}
            rigidHalfHeight={3}
            arrows={false}
            alwaysVisible
        />
    )
}

export default Player