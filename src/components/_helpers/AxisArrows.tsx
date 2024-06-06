import { Component, JSX, onCleanup, onMount } from 'solid-js'
import * as THREE from 'three'

type AxisArrowsProps = {
    parent: THREE.Group | THREE.Mesh
}

const AxisArrows: Component<AxisArrowsProps> = ({ parent }) => {
    onMount(() => {
        // Calculate the top position of the parent
        const parentBoundingBox = new THREE.Box3().setFromObject(parent)
        const parentHeight = parentBoundingBox.max.y - parentBoundingBox.min.y
        const topPosition = new THREE.Vector3(0, parentHeight / 2 - 1, 0)

        const arrowX = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            topPosition.clone(),
            2,
            0xff0000
        )
        parent.add(arrowX)

        const arrowY = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            topPosition.clone(),
            2,
            0x0000ff
        )
        parent.add(arrowY)

        const arrowZ = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            topPosition.clone(),
            2,
            0x00ff00
        )
        parent.add(arrowZ)

        onCleanup(() => {
            parent.remove(arrowX)
            parent.remove(arrowY)
            parent.remove(arrowZ)
        })
    })

    return null
}

export default AxisArrows
