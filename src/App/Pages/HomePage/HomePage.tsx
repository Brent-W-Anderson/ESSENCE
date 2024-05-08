import { Component, createSignal } from 'solid-js'
import * as THREE from 'three'
import Cube from '../../../components/objects/Cube'
import Floor from '../../../components/objects/Floor'
import Lights from '../../../components/scene/Lights'
import PlayerCamera from '../../../components/scene/PlayerCamera'
import PlayerMovement from '../../../components/scene/PlayerMovement'
import Renderer from '../../../components/scene/Renderer'

const HomePage: Component = () => {
    const [cubeRef, setCubeRef] = createSignal<any>()
    const [test, setTest] = createSignal<any>()
    const [floorRef, setFloorRef] = createSignal<THREE.Object3D>()

    return (
        <>
            <h1>HomePage - Cube Test</h1>
            <Renderer>
                <Lights />

                <Cube onCubeCreated={setCubeRef} setTest={setTest} useGravity />
                <Floor onFloorCreated={setFloorRef} />
                {cubeRef() && test() && floorRef() && (
                    <>
                        <PlayerCamera target={test()!} />
                        <PlayerMovement
                            cubeRef={cubeRef()!}
                            floorRef={floorRef()!}
                        />
                    </>
                )}
            </Renderer>
        </>
    )
}

export default HomePage
