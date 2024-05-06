import { Component, onMount } from 'solid-js'
import * as THREE from 'three'
import positionController from '../helpers/PositionController'

type FloorProps = {
    scene: THREE.Scene
    onFloorCreated: (floor: THREE.Mesh) => void
}

const Floor: Component<FloorProps> = ({ scene, onFloorCreated }) => {
    let floor: THREE.Mesh | null = null

    onMount(() => {
        const floorGeometry = new THREE.PlaneGeometry(40, 40)
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080
        })
        floor = new THREE.Mesh(floorGeometry, floorMaterial)

        floor.rotation.x = -Math.PI / 2
        floor.position.y = -0.5
        floor.receiveShadow = true

        scene.add(floor)
        positionController.addObject('floor', floor)

        onFloorCreated(floor)

        return () => {
            if (floor) {
                scene.remove(floor)
                positionController.removeObject('floor')
            }
        }
    })

    return null
}

export default Floor
