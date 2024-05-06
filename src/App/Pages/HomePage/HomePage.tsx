import { Component, createEffect, createSignal } from 'solid-js'
import * as THREE from 'three'
import Cube from '../../../components/objects/Cube'
import Floor from '../../../components/objects/Floor'
import Lights from '../../../components/scene/Lights'
import PlayerCamera from '../../../components/scene/PlayerCamera'
import Renderer from '../../../components/scene/Renderer'
import PlayerMovement from '../../../components/scene/PlayerMovement'

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

    const updateRendererSize = () => {
        const width = window.innerWidth
        const height = window.innerHeight
        renderer.setSize(width, height)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
    }

    createEffect(() => {
        updateRendererSize()
        window.addEventListener('resize', updateRendererSize)
        return () => window.removeEventListener('resize', updateRendererSize)
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
                <PlayerMovement
                    camera={camera}
                    cubeRef={cubeRef}
                    floorRef={floorRef}
                />
            </Renderer>
        </>
    )
}

export default HomePage
