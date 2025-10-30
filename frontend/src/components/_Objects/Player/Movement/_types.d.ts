import { Vector2, Vector3, Object3D, Line } from 'three'

export interface PlayerMovementContextProps {
    canJump: boolean
    canJumpTimeout: number | null
    intervalIdRef: { current: number | null }
    isAKeyDown: boolean
    isDKeyDown: boolean
    isJumping: boolean
    isRightClickHeldRef: { current: boolean }
    isSKeyDown: boolean
    isWKeyDown: boolean
    lastJumpPressTime: number
    lastPosition: Vector3
    mouse: [() => Vector2, ( value: Vector2 ) => void]
    movementTimeout: number | null
    pointer: [() => Object3D | null, ( value: Object3D | null ) => void]
    rayLines: [() => Line[], ( value: Line[] ) => void]
    setUpdateTargetPosition: ( fn: () => void ) => void
    targetPos: Vector3
    updateTargetPosition: () => void
}