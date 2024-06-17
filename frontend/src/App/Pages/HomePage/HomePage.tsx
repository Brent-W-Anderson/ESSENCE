import { Component, Suspense } from 'solid-js'
import Cube from '@/components/_Objects/Cube'
import Floor from '@/components/_Objects/Floor'
import Player from '@/components/_Objects/Player/Player'
import PlayerCamera from '@/components/_Objects/Player/PlayerCamera/PlayerCamera'
import PlayerMovement from '@/components/_Objects/Player/PlayerMovement/PlayerMovement'
import PlayerMovementProvider from '@/components/_Objects/Player/PlayerMovement/PlayerMovementContext'
import Lights from '@/components/_Scene/Lights'
import Renderer from '@/components/_Scene/Renderer'

const HomePage: Component = () => {
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
                <PlayerMovementProvider>
                    <Lights />

                    {/* objects */}
                    <Player initialPosition={{ x: 0, y: 6, z: 0 }} />

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

                    {/* PlayerCamera and PlayerMovement are both dependent on the floor */}
                    <Floor>
                        <PlayerCamera />
                        <PlayerMovement />
                    </Floor>
                </PlayerMovementProvider>
            </Renderer>
        </Suspense>
    )
}

export default HomePage
