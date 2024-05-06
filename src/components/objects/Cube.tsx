import { Component, onMount } from 'solid-js'
import * as THREE from 'three'
import AxisArrows from '../helpers/AxisArrows'
import positionController from '../helpers/PositionController'

type CubeProps = {
    scene: THREE.Scene
    onCubeCreated: (cube: THREE.Group) => void
}

const Cube: Component<CubeProps> = ({ scene, onCubeCreated }) => {
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

        onCubeCreated(group)

        return () => {
            scene.remove(group)
            positionController.removeObject('cube')
        }
    })

    return <AxisArrows parent={group} />
}

export default Cube
