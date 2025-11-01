import { Component, onCleanup, onMount } from 'solid-js'
import {
    BoxGeometry,
    Group,
    Mesh,
    MeshStandardMaterial
} from 'three'
import AxisArrows from './Helpers/AxisArrows'
import Coordinates from './Helpers/Coordinates'
import { useSceneContext } from '@/components/_Scene/Context'

const Cube: Component<{
    index: number
    initialPosition: { x: number; y: number; z: number }
    scale: { d: number; h: number; w: number }
}> = ( { index, scale, initialPosition } ) => {
    const {
        scene,
        createRigidBody,
        setObjectsRef
    } = useSceneContext()!

    const geometry = new BoxGeometry( scale.w, scale.h, scale.d )
    const material = new MeshStandardMaterial( { color: 0x00aaff } )
    const cube = new Mesh( geometry, material )

    onMount( () => {
        cube.castShadow = true
        cube.receiveShadow = true
        cube.position.set(
            initialPosition.x,
            initialPosition.y + scale.h / 2,
            initialPosition.z
        )

        setObjectsRef!( ( prev: { index: number; mesh: Mesh }[] ) => [
            ...prev,
            {
                index,
                mesh: cube
            }
        ] )

        scene.add( cube )

        const rigid = createRigidBody( cube, 0, {
            width: scale.w / 2,
            height: scale.h / 2,
            depth: scale.d / 2
        } )

        onCleanup( () => {
            if ( cube ) {
                scene.remove( cube )
                geometry.dispose()
                material.dispose()
                rigid.dispose()
            }
        } )
    } )

    const helperGroup = new Group()

    return (
        <>
            <AxisArrows mesh={cube} helper={helperGroup} />
            <Coordinates mesh={cube} helper={helperGroup} />
        </>
    )
}

export default Cube