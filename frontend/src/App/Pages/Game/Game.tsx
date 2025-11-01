import { Component, Suspense } from 'solid-js'
import Cube from '@/components/_Objects/Cube'
import Floor from '@/components/_Objects/Floor'
import Lights from '@/components/_Objects/Lights'
import PlayerCamera from '@/components/_Objects/Player/Camera'
import PlayerMovement from '@/components/_Objects/Player/Movement'
import PlayerMovementProvider from '@/components/_Objects/Player/Movement/Context'
import Player from '@/components/_Objects/Player/Player'
import { useSceneContext } from '@/components/_Scene/Context'
import Renderer from '@/components/_Scene/Renderer'

const GamePage: Component = () => {
    const { floorRef } = useSceneContext()!

    return (
        <Suspense
            fallback={
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            }
        >
            <h1>Player Controller</h1>

            <Renderer>
                {/* OBJECTS */}
                <Lights />

                <Cube
                    index={0}
                    scale={{
                        h: 1,
                        w: 4,
                        d: 4
                    }}
                    initialPosition={{
                        x: 0,
                        y: 0,
                        z: 0
                    }}
                />

                <Cube
                    index={1}
                    scale={{
                        h: 3.7,
                        w: 20,
                        d: 4
                    }}
                    initialPosition={{
                        x: 2,
                        y: 0,
                        z: -20
                    }}
                />

                <Cube
                    index={2}
                    scale={{
                        h: 0.5,
                        w: 4,
                        d: 4
                    }}
                    initialPosition={{
                        x: 2,
                        y: 0,
                        z: -10
                    }}
                />

                <Cube
                    index={3}
                    scale={{
                        h: 10,
                        w: 4,
                        d: 4
                    }}
                    initialPosition={{
                        x: -12,
                        y: 0,
                        z: -20
                    }}
                />

                <Cube
                    index={4}
                    scale={{
                        h: 12,
                        w: 4,
                        d: 4
                    }}
                    initialPosition={{
                        x: -6,
                        y: 0,
                        z: -12
                    }}
                />

                <Cube
                    index={5}
                    scale={{
                        h: 7,
                        w: 20,
                        d: 10
                    }}
                    initialPosition={{
                        x: 2,
                        y: 0,
                        z: -27
                    }}
                />

                <Floor />

                {/* PLAYER */}
                <Player initialPosition={{
                    x: 0,
                    y: 6,
                    z: 0
                }} />
                {floorRef!() && (
                    <PlayerMovementProvider>
                        <PlayerCamera />
                        <PlayerMovement />
                    </PlayerMovementProvider>
                )}
            </Renderer>
        </Suspense>
    )
}

export default GamePage