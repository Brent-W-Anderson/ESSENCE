import { Component, createSignal } from 'solid-js'
import * as THREE from 'three'
import Cube from '../../../components/objects/Cube'
import Floor from '../../../components/objects/Floor'
import Lights from '../../../components/scene/Lights'
import PlayerCamera from '../../../components/scene/PlayerCamera'
import PlayerMovement from '../../../components/scene/PlayerMovement'
import Renderer from '../../../components/scene/Renderer'
import * as Ammo from 'ammojs3'

const HomePage: Component = () => {
    const [rigidPlayerRef, setRigidPlayerRef] = createSignal<Ammo.default.btRigidBody>()
    const [playerRef, setPlayerRef] = createSignal<THREE.Group | THREE.Mesh>()
    const [floorRef, setFloorRef] = createSignal<THREE.Mesh>()

    return (
        <>
            <h1>HomePage - Cube Test</h1>
            <Renderer>
                <Lights />

                <Cube setPlayerRef={setPlayerRef} setRigidPlayerRef={setRigidPlayerRef} useGravity />
                <Floor onFloorCreated={setFloorRef} />
                {playerRef() && rigidPlayerRef() && floorRef() && (
                    <>
                        <PlayerCamera playerRef={playerRef()!} />
                        <PlayerMovement
                            rigidPlayerRef={rigidPlayerRef()!}
                            floorRef={floorRef()!}
                        />
                    </>
                )}
            </Renderer>
        </>
    )
}

export default HomePage
