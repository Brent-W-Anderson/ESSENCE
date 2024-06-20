import { Component, Suspense } from 'solid-js'
import Cube from '@/components/_Objects/Cube'
import Floor from '@/components/_Objects/Floor'
import PerformanceStats from '@/components/_Objects/Helpers/PerformanceStats'
import Lights from '@/components/_Objects/Lights'
import PlayerCamera from '@/components/_Objects/Player/Camera'
import PlayerMovement from '@/components/_Objects/Player/Movement'
import PlayerMovementProvider from '@/components/_Objects/Player/Movement/Context'
import Player from '@/components/_Objects/Player/Player'
import { useSceneContext } from '@/components/_Scene/Context'
import Renderer from '@/components/_Scene/Renderer'

const HomePage: Component = () => {
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

            {/* HELPERS */}
            <PerformanceStats />

            <Renderer>
                {/* OBJECTS */}
                <Lights />

                <Cube
                    index={0}
                    scale={{ h: 1, w: 2, d: 2 }}
                    initialPosition={{ x: 0, y: 0, z: 0 }}
                />

                <Cube
                    index={1}
                    scale={{ h: 0.2, w: 2, d: 2 }}
                    initialPosition={{ x: 6, y: 4, z: -2 }}
                />

                <Cube
                    index={2}
                    scale={{ h: 4, w: 4, d: 10 }}
                    initialPosition={{ x: 2, y: 4, z: -14 }}
                />

                <Cube
                    index={3}
                    scale={{ h: 0.5, w: 2, d: 2 }}
                    initialPosition={{ x: 5, y: 0, z: 5 }}
                />

                <Cube
                    index={4}
                    scale={{ h: 0.4, w: 2, d: 2 }}
                    initialPosition={{ x: -5, y: 0, z: -5 }}
                />

                <Floor />

                {/* PLAYER */}
                <Player initialPosition={{ x: 0, y: 6, z: 0 }} />
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

export default HomePage
