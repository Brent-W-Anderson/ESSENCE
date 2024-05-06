import { Component, createEffect, createSignal, onCleanup } from 'solid-js'
import * as THREE from 'three'

interface PlayerMovementProps {
  camera: THREE.PerspectiveCamera
  cubeRef: () => THREE.Object3D | null
  floorRef: () => THREE.Object3D | null
}

const PlayerMovement: Component<PlayerMovementProps> = ({ camera, cubeRef, floorRef }) => {
  let targetPos = new THREE.Vector3()
  const [mouse, setMouse] = createSignal(new THREE.Vector2(0, 0))
  let isMouseDown = false
  let intervalId: number | null = null

  const updateMousePosition = (event: MouseEvent) => {
    setMouse(new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    ))
  }

  const updateTargetPosition = () => {
    const mouseVec = mouse()
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouseVec, camera)

    const intersects = raycaster.intersectObjects([floorRef()!])
    if (intersects.length > 0) {
      targetPos = intersects[0].point
    }
  }

  const onMouseDown = (event: MouseEvent) => {
    if (event.button === 0) {
      isMouseDown = true
      updateMousePosition(event)
      updateTargetPosition()

      intervalId = window.setInterval(updateTargetPosition, 100)
    }
  }

  const onMouseUp = (event: MouseEvent) => {
    if (event.button === 0) {
      isMouseDown = false

      if (intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
  }

  const animateCube = () => {
    const cube = cubeRef()

    if (cube) {
      const direction = new THREE.Vector3(
        targetPos.x - cube.position.x,
        0,
        targetPos.z - cube.position.z
      )

      const targetAngle = Math.atan2(direction.x, direction.z) + Math.PI
      const targetQuaternion = new THREE.Quaternion()
      targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle)

      const distance = cube.position.distanceTo(targetPos)
      const movementSpeed = 0.1
      const rotationSpeed = 1 / 10

      if (distance > 1) {
        const step = direction.multiplyScalar(movementSpeed / distance)
        cube.quaternion.slerp(targetQuaternion, rotationSpeed)
        cube.position.add(step)
        camera.position.add(step)
      }
    }

    requestAnimationFrame(animateCube)
  }

  createEffect(() => {
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', updateMousePosition)

    animateCube()

    onCleanup(() => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousemove', updateMousePosition)

      if (intervalId !== null) {
        clearInterval(intervalId)
      }
    })
  })

  return null
}

export default PlayerMovement
