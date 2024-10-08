import { createEffect, Component, createSignal } from 'solid-js'
import { AmbientLight, DirectionalLight, Vector3 } from 'three'
import { useSceneContext } from '../_Scene/Context'

const Lights: Component = () => {
    const { scene } = useSceneContext()!
    const [time, setTime] = createSignal(0)
    const updateLightPosition = (time: number) => {
        const radius = 100
        const speed = 1 / 100000
        const angle = time * speed

        const x = radius * Math.cos(angle)
        const y = radius * Math.cos(angle) + 150
        const z = radius * Math.sin(angle)

        return new Vector3(x, y, z)
    }

    const animateLight = () => {
        setTime(Date.now())
        requestAnimationFrame(animateLight)
    }

    createEffect(() => {
        const ambientLight = new AmbientLight(0xffffff, 0.5)

        const directionalLight = new DirectionalLight(0xffffff, 1)
        directionalLight.castShadow = true

        // Adjust the shadow camera properties to cover a larger area
        directionalLight.shadow.camera.near = 1
        directionalLight.shadow.camera.far = 500
        directionalLight.shadow.camera.left = -1000
        directionalLight.shadow.camera.right = 1000
        directionalLight.shadow.camera.top = 1000
        directionalLight.shadow.camera.bottom = -1000

        // Optional: Increase shadow map size for better quality shadows
        directionalLight.shadow.mapSize.width = 40000
        directionalLight.shadow.mapSize.height = 40000

        // Smooth shadows by setting the radius
        directionalLight.shadow.radius = 2

        scene.add(ambientLight)
        scene.add(directionalLight)

        animateLight()

        return () => {
            scene.remove(ambientLight)
            scene.remove(directionalLight)
        }
    })

    createEffect(() => {
        const position = updateLightPosition(time())

        scene.children
            .filter(child => child instanceof DirectionalLight)
            .forEach(child => {
                const light = child as DirectionalLight
                light.position.copy(position)
            })
    })

    return null
}

export default Lights
