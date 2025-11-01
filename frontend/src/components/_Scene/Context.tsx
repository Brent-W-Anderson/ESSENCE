import {
    createContext,
    useContext,
    Component,
    createSignal,
    createEffect,
    JSX,
    Suspense,
    onMount,
    onCleanup
} from 'solid-js'
import {
    Color,
    Group,
    Mesh,
    PerspectiveCamera,
    Scene,
    WebGLRenderer
} from 'three'
import { SceneContextProps } from './_types'
import { SCENE } from '@/config'
import AmmoFactory from 'ammojs3'

// The object you get *after* calling the factory:
type AmmoModule = Awaited<ReturnType<typeof AmmoFactory>>
type DynamicsWorld = InstanceType<AmmoModule['btDiscreteDynamicsWorld']>
type RigidBody = InstanceType<AmmoModule['btRigidBody']>

const SceneContext = createContext<SceneContextProps>()

const [physicsWorld, setPhysicsWorld] = createSignal<DynamicsWorld>()

const SceneProvider: Component<{
    children: JSX.Element | JSX.Element[]
}> = props => {
    const [AmmoLib, setAmmoLib] = createSignal<AmmoModule>()
    const [rigidPlayerRef, setRigidPlayerRef] = createSignal<RigidBody>()
    const [playerRef, setPlayerRef] = createSignal<Group | Mesh>()
    const [floorRef, setFloorRef] = createSignal<Mesh>()
    const [objectsRef, setObjectsRef]
        = createSignal<{ index: number; mesh: Mesh }[]>( [] )
    const [camera, setCamera] = createSignal( new PerspectiveCamera (
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000 // view distance
    ) )

    const scene = new Scene()
    scene.background = new Color( 0xbbbbff )

    const initializeAmmo = async ( module: typeof window.Ammo ) => {
        try {
            // Build physics world
            const collisionConfig = new module.btDefaultCollisionConfiguration()
            const dispatcher
                = new module.btCollisionDispatcher( collisionConfig )
            const broadphase = new module.btDbvtBroadphase()
            const solver = new module.btSequentialImpulseConstraintSolver()
            const world = new module.btDiscreteDynamicsWorld(
                dispatcher,
                broadphase,
                solver,
                collisionConfig
            )
            const gravity = new module.btVector3( 0, SCENE.gravity, 0 )
            world.setGravity( gravity )
            module.destroy( gravity )

            setPhysicsWorld( world )
            setAmmoLib( () => module )
            animate()
        } catch ( err ) {
            console.error( 'Failed to initialize Ammo.js:', err )
        }
    }

    onMount( async () => {
        const src = '/assets/js/ammo.wasm.js'
        let script = document.querySelector<HTMLScriptElement>( `script[src="${src}"]` )

        if ( !script ) {
            script = document.createElement( 'script' )
            script.src = src
            script.defer = true
            script.addEventListener( 'load', async () => initializeAmmo( await window.Ammo() ), { once: true } )
            script.addEventListener( 'error', ( e ) => {
                console.error( 'Failed to load ammo.wasm.js', e )
            }, { once: true } )
            document.head.appendChild( script )
        } else {
            initializeAmmo( window.Ammo )
        }
    } )

    let physicsRafId: number | null = null
    let isDisposed = false

    const animate = () => {
        if ( isDisposed ) return
        physicsRafId = requestAnimationFrame( animate )

        if ( physicsWorld() ) {
            physicsWorld()!.stepSimulation( 1 / 60, 10 )
        }
    }

    const createRigidBody = (
        mesh: Group|Mesh,
        mass: number,
        size: {depth:number; height:number; width:number;}
    ) => {
        const ammo = AmmoLib()
        const world = physicsWorld()
        if ( !ammo ) return

        const halfExtents = new ammo.btVector3(
            size.width,
            size.height,
            size.depth
        )
        const shape = new ammo.btBoxShape( halfExtents )
        shape.setMargin( 0 )
        ammo.destroy( halfExtents )

        const transform = new ammo.btTransform()
        transform.setIdentity()

        const rotation = new ammo.btQuaternion(
            mesh.quaternion.x,
            mesh.quaternion.y,
            mesh.quaternion.z,
            mesh.quaternion.w
        )
        transform.setRotation( rotation )
        ammo.destroy( rotation )

        const origin = new ammo.btVector3(
            mesh.position.x,
            mesh.position.y,
            mesh.position.z
        )
        transform.setOrigin( origin )
        ammo.destroy( origin )

        const motionState = new ammo.btDefaultMotionState( transform )
        ammo.destroy( transform )

        const localInertia = new ammo.btVector3( 0, 0, 0 )
        if ( mass !== 0 ) shape.calculateLocalInertia( mass, localInertia )

        const rbInfo = new ammo.btRigidBodyConstructionInfo(
            mass,
            motionState,
            shape,
            localInertia
        )
        const body = new ammo.btRigidBody( rbInfo )

        ammo.destroy( localInertia )
        ammo.destroy( rbInfo )

        if ( world ) world.addRigidBody( body )

        const dispose = () => {
            // Always remove from world first
            if ( world ) world.removeRigidBody( body )
        }

        return {
            body,
            dispose
        }
    }

    // in Provider, replace updateMesh with a version that returns a stop() function
    const updateMesh = ( mesh: Group | Mesh, rigidBody: RigidBody ) => {
        const ammo = AmmoLib()
        if ( !ammo ) return () => {}

        let alive = true
        let rafId: number | null = null

        const tick = () => {
            if ( !alive ) return

            const t = new ammo.btTransform()
            rigidBody.getMotionState().getWorldTransform( t )

            const o = t.getOrigin(), r = t.getRotation()
            mesh.position.set( o.x(), o.y(), o.z() )
            mesh.quaternion.set( r.x(), r.y(), r.z(), r.w() )

            ammo.destroy( t )
            rafId = requestAnimationFrame( tick )
        }
        rafId = requestAnimationFrame( tick )
        return () => {
            alive = false; if ( rafId !== null ) cancelAnimationFrame( rafId )
        }
    }

    let renderer = new WebGLRenderer()
    const updateRendererSize = () => {
        const width = window.innerWidth
        const height = window.innerHeight
        renderer.setSize( width, height )
        camera().aspect = width / height
        camera().updateProjectionMatrix()
    }

    createEffect( () => {
        updateRendererSize()
        window.addEventListener( 'resize', updateRendererSize )

        onCleanup( () => {
            isDisposed = true
            if ( physicsRafId !== null ) cancelAnimationFrame( physicsRafId )
            window.removeEventListener( 'resize', updateRendererSize )

            // remove bodies from world
            setRigidPlayerRef( undefined )
            setPlayerRef( undefined )
            setFloorRef( undefined )
            setPhysicsWorld( undefined )
            setAmmoLib( undefined )
            setObjectsRef( [] )

            if ( renderer ) {
                const canvas = renderer.domElement

                // Lose the GL context
                try {
                    renderer.forceContextLoss()
                } catch {
                    const gl = renderer.getContext()
                    gl?.getExtension( 'WEBGL_lose_context' )?.loseContext()
                }

                // Remove the canvas
                if ( canvas && canvas.parentNode ) {
                    canvas.parentNode.removeChild( canvas )
                }

                // Dispose Three.js-managed objects
                renderer.dispose()
            }
        } )
    } )

    const store = {
        scene,
        camera,
        setCamera,
        renderer,
        physicsWorld,
        createRigidBody,
        updateMesh,
        AmmoLib,
        rigidPlayerRef,
        setRigidPlayerRef,
        playerRef,
        setPlayerRef,
        floorRef,
        setFloorRef,
        objectsRef,
        setObjectsRef
    }

    return (
        <Suspense
            fallback={
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            }
        >
            {
                AmmoLib() ? (
                    <SceneContext.Provider value={store}>
                        {props.children}
                    </SceneContext.Provider>
                ) : (
                    <div class="loading">
                        <div class="spinner"></div>
                    </div>
                )
            }
        </Suspense>
    )
}

export default SceneProvider

export const useSceneContext = () => useContext( SceneContext )