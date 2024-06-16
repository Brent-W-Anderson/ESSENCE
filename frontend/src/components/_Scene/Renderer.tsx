import { createEffect, Component, JSX } from 'solid-js'
import { useSceneContext } from './SceneContext'

type RendererProps = {
    children?: JSX.Element | JSX.Element[]
}

const Renderer: Component<RendererProps> = ({ children }) => {
    const context = useSceneContext()
    if (!context) return

    const { scene, camera, renderer } = context

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
