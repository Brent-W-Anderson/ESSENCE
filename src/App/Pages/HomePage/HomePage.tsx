import * as Ammo from 'ammojs3'
import { Component, createSignal, onMount } from 'solid-js'
import * as THREE from 'three'
import Player from '../../../components/_Objects/Player/Player'
import Floor from '../../../components/_Objects/Floor'
import Lights from '../../../components/_Scene/Lights'
import PlayerCamera from '../../../components/_Objects/Player/PlayerCamera/PlayerCamera'
import PlayerMovement from '../../../components/_Objects/Player/PlayerMovement/PlayerMovement'
import Renderer from '../../../components/_Scene/Renderer'
import AxisArrows from '../../../components/_Helpers/AxisArrows'
import Cube from '../../../components/_Objects/Cube'

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
                {playerRef() && <AxisArrows parent={playerRef()!} />}

                <Cube
                    height={1}
                    width={2}
                    depth={2}
                    initialPosition={{ x: 0, y: 0, z: 0 }}
                />

                <Cube
                    height={0.2}
                    width={2}
                    depth={2}
                    initialPosition={{ x: 6, y: 4, z: -2 }}
                />

                <Cube
                    height={4}
                    width={4}
                    depth={10}
                    initialPosition={{ x: 2, y: 4, z: -14 }}
                />

                <Cube
                    height={0.5}
                    width={2}
                    depth={2}
                    initialPosition={{ x: 5, y: 0, z: 5 }}
                />

                <Cube
                    height={0.4}
                    width={2}
                    depth={2}
                    initialPosition={{ x: -5, y: 0, z: -5 }}
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
