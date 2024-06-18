import {
    createContext,
    useContext,
    createSignal,
    Component,
    JSX
} from 'solid-js'
import { Line, Object3D, Vector2, Vector3 } from 'three'
import { PlayerMovementContextProps } from './_types'

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
    const [mouse, setMouse] = createSignal(new Vector2(0, 0))
    const [pointer, setPointer] = createSignal<Object3D | null>(null)
    const targetPos = new Vector3()
    const intervalIdRef = { current: null as number | null }
    const isRightClickHeldRef = { current: false }
    let isWKeyDown = false
    let isAKeyDown = false
    let isSKeyDown = false
    let isDKeyDown = false
    let isJumping = false
    let canJump = true
    let lastJumpPressTime = 0
    let lastPosition = new Vector3()
    let movementTimeout: number | null = null
    let canJumpTimeout: number | null = null

    const [rayLines, setRayLines] = createSignal<Line[]>([])
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
                canJump,
                lastJumpPressTime,
                lastPosition,
                movementTimeout,
                canJumpTimeout,
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
