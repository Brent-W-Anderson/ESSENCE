import * as Ammo from 'ammojs3'
import { Component, createSignal } from 'solid-js'
import * as THREE from 'three'
import Player from '../../../components/_objects/Player'
import Floor from '../../../components/_objects/Floor'
import Lights from '../../../components/_scene/Lights'
import PlayerCamera from '../../../components/_scene/PlayerCamera'
import PlayerMovement from '../../../components/_scene/PlayerMovement'
import Renderer from '../../../components/_scene/Renderer'

const HomePage: Component = () => {
    const [rigidPlayerRef, setRigidPlayerRef] =
        createSignal<Ammo.default.btRigidBody>()
    const [playerRef, setPlayerRef] = createSignal<THREE.Group | THREE.Mesh>()
    const [floorRef, setFloorRef] = createSignal<THREE.Mesh>()

    return (
        <>
            <h1>Player Controller</h1>

            <Renderer>
                <Lights />

                {/* objects */}
                <Player
                    setPlayerRef={setPlayerRef}
                    setRigidPlayerRef={setRigidPlayerRef}
                    initialPosition={{ x: 0, y: 6, z: 0 }}
                    useGravity
                />
                <Floor onFloorCreated={setFloorRef} />

                {/* movement controller */}
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
