import { Vector2, Vector3, Object3D, Line } from 'three'

export interface PlayerMovementContextProps {
    mouse: [() => Vector2, ( value: Vector2 ) => void]
    pointer: [
        () => Object3D|null,
        ( value: Object3D|null ) => void
    ]
    targetPos: Vector3
    isWKeyDown: boolean
    isAKeyDown: boolean
    isSKeyDown: boolean
    isDKeyDown: boolean
    isJumping: boolean
    canJump: boolean
    lastJumpPressTime: number
    lastPosition: Vector3
    movementTimeout: number|null
    canJumpTimeout: number|null
    rayLines: [() => Line[], ( value: Line[] ) => void]
    intervalIdRef: { current: number|null }
    isRightClickHeldRef: { current: boolean }
    updateTargetPosition: () => void
    setUpdateTargetPosition: ( fn: () => void ) => void
}
