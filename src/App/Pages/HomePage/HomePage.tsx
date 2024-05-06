import { Component, createEffect, createSignal } from 'solid-js'
import * as THREE from 'three'
import Cube from '../../../components/objects/Cube'
import Floor from '../../../components/objects/Floor'
import Lights from '../../../components/scene/Lights'
import PlayerCamera from '../../../components/scene/PlayerCamera'
import Renderer from '../../../components/scene/Renderer'

const HomePage: Component = () => {
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )

    scene.background = new THREE.Color(0xffffff)
    camera.position.set(0, 2, 5)

    const [cubeRef, setCubeRef] = createSignal<THREE.Object3D | null>(null)
    const [floorRef, setFloorRef] = createSignal<THREE.Object3D | null>(null)
    let targetPos = new THREE.Vector3()
    let isMouseDown = false

    const updateRendererSize = () => {
        const width = window.innerWidth
        const height = window.innerHeight
        renderer.setSize(width, height)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
    }

    const onMouseDown = (event: MouseEvent) => {
        if (event.button === 0) { // Check if left mouse button
            isMouseDown = true
            updateTargetPosition(event)
        }
    }

    const onMouseMove = (event: MouseEvent) => {
        if (isMouseDown) {
            updateTargetPosition(event)
        }
    }

    const onMouseUp = (event: MouseEvent) => {
        if (event.button === 0) { // Check if left mouse button
            isMouseDown = false
        }
    }

    const updateTargetPosition = (event: MouseEvent) => {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        )
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, camera)

        const intersects = raycaster.intersectObjects([floorRef()!])
        if (intersects.length > 0) {
            targetPos = intersects[0].point
        }
    }

    const animateCube = () => {
        const cube = cubeRef()

        if (cube) {
            const direction = new THREE.Vector3(
                targetPos.x - cube.position.x,
                0,
                targetPos.z - cube.position.z
            )

            const targetAngle = Math.atan2(direction.x, direction.z) + Math.PI
            const targetQuaternion = new THREE.Quaternion()
            targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle)

            const distance = cube.position.distanceTo(targetPos)
            const movementSpeed = 0.05
            const rotationSpeed = 1 / 20

            if (distance > 0.1) {
                const step = direction.multiplyScalar(movementSpeed / distance)

                cube.quaternion.slerp(targetQuaternion, rotationSpeed)

                cube.position.add(step)
                camera.position.add(step)
            }
        }

        requestAnimationFrame(animateCube)
    }

    createEffect(() => {
        updateRendererSize()
        window.addEventListener('resize', updateRendererSize)
        renderer.domElement.addEventListener('mousedown', onMouseDown)
        renderer.domElement.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)

        animateCube()

        return () => {
            window.removeEventListener('resize', updateRendererSize)
            renderer.domElement.removeEventListener('mousedown', onMouseDown)
            renderer.domElement.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    })

    return (
        <>
            <h1>HomePage - cube test..</h1>
            <Renderer scene={scene} camera={camera} renderer={renderer}>
                <Lights scene={scene} />
                {cubeRef() && (
                    <PlayerCamera
                        scene={scene}
                        camera={camera}
                        renderer={renderer}
                        target={cubeRef() as THREE.Object3D}
                    />
                )}
                <Cube scene={scene} onCubeCreated={setCubeRef} />
                <Floor scene={scene} onFloorCreated={setFloorRef} />
            </Renderer>
        </>
    )
}

export default HomePage
