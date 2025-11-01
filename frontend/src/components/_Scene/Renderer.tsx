import { createEffect, Component, JSX, onCleanup } from 'solid-js'
import { useSceneContext } from './Context'

type RendererProps = {
    children?: JSX.Element | JSX.Element[]
}

const Renderer: Component<RendererProps> = ( { children } ) => {
    const { scene, camera, renderer } = useSceneContext()!

    createEffect( () => {
        renderer.shadowMap.enabled = true

        let rafId: number | null = null
        const animate = () => {
            rafId = requestAnimationFrame( animate )
            renderer.render( scene, camera() )
        }
        animate()

        onCleanup( () => {
            if ( rafId !== null ) cancelAnimationFrame( rafId )
            renderer.setAnimationLoop( null )
        } )
    } )

    return (
        <>
            {children}
            {renderer.domElement}
        </>
    )
}

export default Renderer