import {
    createContext,
    useContext,
    createSignal,
    Component,
    JSX
} from 'solid-js'
import * as THREE from 'three'

export interface PlayerMovementContextProps {
    mouse: [() => THREE.Vector2, (value: THREE.Vector2) => void]
    pointer: [
        () => THREE.Object3D | null,
        (value: THREE.Object3D | null) => void
    ]
    targetPos: THREE.Vector3
    isWKeyDown: boolean
    isAKeyDown: boolean
    isSKeyDown: boolean
    isDKeyDown: boolean
    isJumping: boolean
    jumped: boolean
    rayLines: [() => THREE.Line[], (value: THREE.Line[]) => void]
    intervalIdRef: { current: number | null }
    isRightClickHeldRef: { current: boolean }
    updateTargetPosition: () => void
    setUpdateTargetPosition: (fn: () => void) => void
}

const PlayerMovementContext = createContext<PlayerMovementContextProps>()

export const usePlayerMovementContext = () => {
    const context = useContext(PlayerMovementContext)
    if (!context) {
        throw new Error(
            'usePlayerMovementContext must be used within a PlayerMovementProvider'
        )
    }
    return context
}

const PlayerMovementProvider: Component<{ children: JSX.Element }> = props => {
    const [mouse, setMouse] = createSignal(new THREE.Vector2(0, 0))
    const [pointer, setPointer] = createSignal<THREE.Object3D | null>(null)
    const targetPos = new THREE.Vector3()
    const intervalIdRef = { current: null as number | null }
    const isRightClickHeldRef = { current: false }
    let isWKeyDown = false
    let isAKeyDown = false
    let isSKeyDown = false
    let isDKeyDown = false
    let isJumping = false
    let jumped = false
    const [rayLines, setRayLines] = createSignal<THREE.Line[]>([])
    let updateTargetPosition = () => {}

    const setUpdateTargetPosition = (fn: () => void) => {
        updateTargetPosition = fn
    }

    return (
        <PlayerMovementContext.Provider
            value={{
                mouse: [mouse, setMouse],
                pointer: [pointer, setPointer],
                targetPos,
                isWKeyDown,
                isAKeyDown,
                isSKeyDown,
                isDKeyDown,
                isJumping,
                jumped,
                rayLines: [rayLines, setRayLines],
                intervalIdRef,
                isRightClickHeldRef,
                updateTargetPosition,
                setUpdateTargetPosition
            }}
        >
            {props.children}
        </PlayerMovementContext.Provider>
    )
}

export default PlayerMovementProvider
