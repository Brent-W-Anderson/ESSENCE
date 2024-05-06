import { createEffect, Component, createSignal } from 'solid-js'
import * as THREE from 'three'

type LightsProps = {
    scene: THREE.Scene
}

const Lights: Component<LightsProps> = ({ scene }) => {
    const [time, setTime] = createSignal(0)

    const updateLightPosition = (time: number) => {
        const radius = 100
        const speed = 1 / 100000
        const angle = time * speed

        const x = radius * Math.cos(angle)
        const y = radius * Math.cos(angle) + 150
        const z = radius * Math.sin(angle)

        return new THREE.Vector3(x, y, z)
    }

    createEffect(() => {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        scene.add(directionalLight)

        const animateLight = () => {
            setTime(Date.now())
            requestAnimationFrame(animateLight)
        }
        animateLight()

        return () => {
            scene.remove(ambientLight)
            scene.remove(directionalLight)
        }
    })

    createEffect(() => {
        const position = updateLightPosition(time())

        scene.children
            .filter(child => child instanceof THREE.DirectionalLight)
            .forEach(child => {
                const light = child as THREE.DirectionalLight
                light.position.copy(position)
            })
    })

    return null
}

export default Lights
