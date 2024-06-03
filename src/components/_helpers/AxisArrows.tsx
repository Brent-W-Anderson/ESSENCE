import { Component } from 'solid-js'
import * as THREE from 'three'

type AxisArrowsProps = {
    parent: THREE.Group | THREE.Mesh
}

const AxisArrows: Component<AxisArrowsProps> = ({ parent }) => {
    const arrowX = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        2,
        0xff0000
    )
    parent.add(arrowX)

    const arrowY = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0),
        2,
        0x0000ff
    )
    parent.add(arrowY)

    const arrowZ = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        2,
        0x00ff00
    )
    parent.add(arrowZ)

    return null
}

export default AxisArrows
