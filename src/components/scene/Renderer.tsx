import { createEffect, Component } from 'solid-js'
import * as THREE from 'three'

type RendererProps = {
    children?: any
    scene: THREE.Scene
    camera: THREE.Camera
    renderer: THREE.WebGLRenderer
}

const Renderer: Component<RendererProps> = ({
    children,
    scene,
    camera,
    renderer
}) => {    
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
