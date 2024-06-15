import { Component, Suspense, createSignal } from 'solid-js'
import * as THREE from 'three'
import AxisArrows from '@/components/_Helpers/AxisArrows'
import Cube from '@/components/_Objects/Cube'
import Floor from '@/components/_Objects/Floor'
import Player from '@/components/_Objects/Player/Player'
import PlayerCamera from '@/components/_Objects/Player/PlayerCamera/PlayerCamera'
import PlayerMovement from '@/components/_Objects/Player/PlayerMovement/PlayerMovement'
import PlayerMovementProvider from '@/components/_Objects/Player/PlayerMovement/PlayerMovementContext'
import Lights from '@/components/_Scene/Lights'
import Renderer from '@/components/_Scene/Renderer'
import { useSceneContext } from '@/components/_Scene/SceneContext'

const HomePage: Component = () => {
    const context = useSceneContext()
    if (!context) return

    const { playerRef } = context
    const [objectsRef, setObjectsRef] = createSignal<
        { index: number; mesh: THREE.Mesh }[]
    >([])

    const addObjectsRef = (index: number, mesh: THREE.Mesh) => {
        setObjectsRef(prev => [...prev, { index, mesh }])
    }

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
                <Lights />

                {/* objects */}
                <Player initialPosition={{ x: 0, y: 6, z: 0 }} useGravity />
                {playerRef?.() && (
                    <AxisArrows mesh={playerRef()} rigidHalfHeight={3} />
                )}

                <Cube
                    index={0}
                    scale={{ h: 1, w: 2, d: 2 }}
                    initialPosition={{ x: 0, y: 0, z: 0 }}
                    addObjectsRef={addObjectsRef}
                />
                {objectsRef()[0] && <AxisArrows mesh={objectsRef()[0].mesh} />}

                <Cube
                    index={0}
                    scale={{ h: 0.2, w: 2, d: 2 }}
                    initialPosition={{ x: 6, y: 4, z: -2 }}
                    addObjectsRef={addObjectsRef}
                />
                {objectsRef()[0] && <AxisArrows mesh={objectsRef()[1].mesh} />}

                <Cube
                    index={2}
                    scale={{ h: 4, w: 4, d: 10 }}
                    initialPosition={{ x: 2, y: 4, z: -14 }}
                    addObjectsRef={addObjectsRef}
                />
                {objectsRef()[2] && <AxisArrows mesh={objectsRef()[2].mesh} />}

                <Cube
                    index={3}
                    scale={{ h: 0.5, w: 2, d: 2 }}
                    initialPosition={{ x: 5, y: 0, z: 5 }}
                    addObjectsRef={addObjectsRef}
                />
                {objectsRef()[3] && <AxisArrows mesh={objectsRef()[3].mesh} />}

                <Cube
                    index={4}
                    scale={{ h: 0.4, w: 2, d: 2 }}
                    initialPosition={{ x: -5, y: 0, z: -5 }}
                    addObjectsRef={addObjectsRef}
                />
                {objectsRef()[4] && <AxisArrows mesh={objectsRef()[4].mesh} />}

                {/* PlayerCamera and PlayerMovement are both dependent on the floor */}
                <Floor>
                    <PlayerCamera />
                    <PlayerMovementProvider>
                        <PlayerMovement />
                    </PlayerMovementProvider>
                </Floor>
            </Renderer>
        </Suspense>
    )
}

export default HomePage
