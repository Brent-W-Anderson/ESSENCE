import { createEffect, Component, JSX } from 'solid-js'
import { useSceneContext } from './Context'

type RendererProps = {
    children?: JSX.Element | JSX.Element[]
}

const Renderer: Component<RendererProps> = ({ children }) => {
    const { scene, camera, renderer } = useSceneContext()!

    createEffect(() => {
        renderer.shadowMap.enabled = true

        const animate = () => {
            requestAnimationFrame(animate)
            renderer.render(scene, camera)
        }

        animate()

        return () => {
            renderer.dispose()
        }
    })

    return (
        <>
            {children}
            {renderer.domElement}
        </>
    )
}

export default Renderer
