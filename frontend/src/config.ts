/* NOTE: saving in here while running the project in dev will require a
    manual browser refresh */

// SCENE
export const SCENE={
    gravity: -50
}

// PLAYER
export const PLAYER_CAMERA={
    distance: 20,
    // set camera floating
    floatPolarAngle: false,
    floatAzimuthAngle: false,
    cameraFloatEasing: 0.1,
    // set default rotation
    currentPolarAngle: 1,
    currentAzimuthAngle: 0,
    // camera rotation
    arrowKeyRotationSensitivity: 0.02,
    mouseRotationSensitivity: 0.003
}

export const PLAYER_MOVEMENT_INDICATOR={
    // how long the targeted location will stay active (while not moving).
    threshold: 1000,
    ringColor: 0x00ff00,
    ringThickness: 0.05,
    outerRadius: 0.4,
    segments: 32
}

export const PLAYER_MOVEMENT={
    movementSpeed: 12,
    rotationSpeed: 0.15,
    INDICATOR: PLAYER_MOVEMENT_INDICATOR
}

export const PLAYER_BUMPER={
    /* If the player hits a ledge and doesn't move, this will timeout the bumper
        being able to jump again with the ray lines */
    canJumpWithRayLinesThreshold: 50, // this stops jumping in place.
    showRayLines: true,
    stepHeight: 0.4,
}

export const PLAYER_JUMPING={
    jumpForce: 20,
    // how long until the player can jump again (prevents jumping during a jump).
    jumpingThreshold: 750,
    fallVelocityTolerance: 0.1,
    allowJumpClimbing: true,
}

export const PLAYER={
    CAMERA: PLAYER_CAMERA,
    MOVEMENT: PLAYER_MOVEMENT,
    BUMPER: PLAYER_BUMPER,
    JUMPING: PLAYER_JUMPING
}

// HELPERS
export const AXIS_ARROWS={
    height: 0.5
}

export const COORDINATES={
    height: 0,
    font: 'Bold 24px Arial',
    fontColor: 'rgba(255,255,255,1.0)',
    fontStrokeColor: 'black'
}

export const HELPERS={
    AXIS_ARROWS: AXIS_ARROWS,
    COORDINATES: COORDINATES
}

// GLOBAL CONFIG
const CONFIG={
    SCENE: SCENE,
    PLAYER: PLAYER,
    HELPERS: HELPERS
}

export default CONFIG
