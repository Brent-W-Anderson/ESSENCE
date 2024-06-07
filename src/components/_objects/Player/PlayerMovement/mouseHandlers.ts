import * as THREE from 'three'

export const updateMousePosition = (
    event: MouseEvent,
    camera: THREE.Camera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    setMouse: (value: THREE.Vector2) => void,
    isRightClickHeld: boolean
) => {
    const mouseVec = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    )
    setMouse(mouseVec)

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouseVec, camera)
    const intersects = raycaster.intersectObjects(scene.children) // Check all objects in the scene

    if (isRightClickHeld) {
        renderer.domElement.style.cursor = 'grabbing'
    } else if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer'
    } else {
        renderer.domElement.style.cursor = 'default'
    }
}

export const updateTargetPosition = (
    mouse: THREE.Vector2,
    camera: THREE.Camera,
    scene: THREE.Scene,
    playerMesh: THREE.Object3D,
    targetPos: THREE.Vector3
) => {
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    // Exclude the player mesh from the raycasting
    const objectsToIntersect = scene.children.filter(obj => obj !== playerMesh)

    const intersects = raycaster.intersectObjects(objectsToIntersect) // Check all objects in the scene except the player
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object
        const boundingBox = new THREE.Box3().setFromObject(intersectedObject)
        const highestPoint = boundingBox.max

        // Ensure the pointer is always on top of the object
        targetPos.set(
            intersects[0].point.x,
            highestPoint.y,
            intersects[0].point.z
        )
    } else {
        // Clear the target position if no intersection
        targetPos.set(0, 0, 0)
    }
}

export const onMouseUp = (
    event: MouseEvent,
    intervalIdRef: { current: number | null },
    updateTargetPositionFn: () => void,
    pointer: THREE.Object3D | null,
    targetPos: THREE.Vector3,
    updateMousePositionFn: (event: MouseEvent) => void,
    isRightClickHeldRef: { current: boolean }
) => {
    if (event.button === 0) {
        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current)
            intervalIdRef.current = null
        }
        updateTargetPositionFn()
        if (pointer && targetPos.y !== 0) {
            pointer.position.set(targetPos.x, targetPos.y, targetPos.z)
            pointer.visible = true // Ensure the pointer is visible
        } else if (pointer) {
            pointer.visible = false // Make the pointer invisible
        }
    } else if (event.button === 2) {
        isRightClickHeldRef.current = false
        updateMousePositionFn(event)
    }
}

export const onMouseDown = (
    event: MouseEvent,
    updateMousePositionFn: (event: MouseEvent) => void,
    updateTargetPositionFn: () => void,
    pointer: THREE.Object3D | null,
    intervalIdRef: { current: number | null },
    isRightClickHeldRef: { current: boolean }
) => {
    if (event.button === 0) {
        updateMousePositionFn(event)
        updateTargetPositionFn()
        if (pointer) {
            pointer.visible = false
        }
        if (intervalIdRef.current === null) {
            intervalIdRef.current = window.setInterval(
                updateTargetPositionFn,
                50
            )
        }
    } else if (event.button === 2) {
        isRightClickHeldRef.current = true
        updateMousePositionFn(event)
    }
}

export const setupMouseHandlers = (
    camera: THREE.Camera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    setMouse: (value: THREE.Vector2) => void,
    updateTargetPositionFn: () => void,
    pointer: THREE.Object3D | null,
    targetPos: THREE.Vector3,
    intervalIdRef: { current: number | null },
    isRightClickHeldRef: { current: boolean }
) => {
    const handleMouseDown = (event: MouseEvent) =>
        onMouseDown(
            event,
            e =>
                updateMousePosition(
                    e,
                    camera,
                    scene,
                    renderer,
                    setMouse,
                    isRightClickHeldRef.current
                ),
            updateTargetPositionFn,
            pointer,
            intervalIdRef,
            isRightClickHeldRef
        )

    const handleMouseUp = (event: MouseEvent) =>
        onMouseUp(
            event,
            intervalIdRef,
            updateTargetPositionFn,
            pointer,
            targetPos,
            e =>
                updateMousePosition(
                    e,
                    camera,
                    scene,
                    renderer,
                    setMouse,
                    isRightClickHeldRef.current
                ),
            isRightClickHeldRef
        )

    const handleMouseMove = (event: MouseEvent) =>
        updateMousePosition(
            event,
            camera,
            scene,
            renderer,
            setMouse,
            isRightClickHeldRef.current
        )

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
        document.removeEventListener('mousedown', handleMouseDown)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('mousemove', handleMouseMove)

        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current)
        }
    }
}
