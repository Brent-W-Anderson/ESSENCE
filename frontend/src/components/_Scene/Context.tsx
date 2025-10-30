import {
    createContext,
    useContext,
    Component,
    createSignal,
    createEffect,
    JSX,
    Suspense
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
import AmmoFactory from 'ammojs-typed'

// The object you get *after* calling the factory:
type AmmoModule = Awaited<ReturnType<typeof AmmoFactory>>
type DynamicsWorld = InstanceType<AmmoModule['btDiscreteDynamicsWorld']>
type RigidBody = InstanceType<AmmoModule['btRigidBody']>

const SceneContext = createContext<SceneContextProps>()

const [physicsWorld, setPhysicsWorld]
    = createSignal<DynamicsWorld>()
const [AmmoLib, setAmmoLib] = createSignal<AmmoModule>()
const [rigidPlayerRef, setRigidPlayerRef]
    = createSignal<RigidBody>()
const [playerRef, setPlayerRef] = createSignal<Group | Mesh>()
const [floorRef, setFloorRef] = createSignal<Mesh>()
const [objectsRef, setObjectsRef] = createSignal<
    { index: number; mesh: Mesh }[]
>( [] )
const [camera, setCamera] = createSignal( new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000 // view distance
) )

const SceneProvider: Component<{
    children: JSX.Element | JSX.Element[]
}> = props => {
    const scene = new Scene()
    const renderer = new WebGLRenderer( { antialias: true } )
    scene.background = new Color( 0xffffff )
    renderer.setSize( window.innerWidth, window.innerHeight )

    const animate = () => {
        requestAnimationFrame( animate )

        if ( physicsWorld() ) {
            physicsWorld()?.stepSimulation( 1 / 60, 10 )
        }

        renderer.render( scene, camera() )
    }

    const createRigidBody = (
        mesh: Group | Mesh,
        mass: number,
        size: { depth: number; height: number; width: number; }
    ) => {
        const ammo = AmmoLib()

        if ( ammo ) {
            const vector
                = new ammo.btVector3( size.width, size.height, size.depth )
            const shape = new ammo.btBoxShape( vector )
            shape.setMargin( 0 )

            const transform = new ammo.btTransform()
            const quaternion = mesh.quaternion
            transform.setIdentity()
            transform.setRotation( new ammo.btQuaternion(
                quaternion.x,
                quaternion.y,
                quaternion.z,
                quaternion.w
            ) )
            transform.setOrigin( new ammo.btVector3(
                mesh.position.x,
                mesh.position.y,
                mesh.position.z
            ) )
            const motionState = new ammo.btDefaultMotionState( transform )
            const localInertia = new ammo.btVector3( 0, 0, 0 )
            shape.calculateLocalInertia( mass, localInertia )

            const rbInfo = new ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                shape,
                localInertia
            )
            const body = new ammo.btRigidBody( rbInfo )

            return body
        }
    }

    const updateMesh = (
        mesh: Group | Mesh,
        rigidBody: RigidBody
    ) => {
        const ammo = AmmoLib()

        if ( ammo ) {
            const transform = new ammo.btTransform()
            rigidBody?.getMotionState().getWorldTransform( transform )

            const origin = transform.getOrigin()
            const rotation = transform.getRotation()

            mesh.position.set( origin.x(), origin.y(), origin.z() )
            mesh.quaternion.set(
                rotation.x(),
                rotation.y(),
                rotation.z(),
                rotation.w()
            )

            requestAnimationFrame( () => updateMesh( mesh, rigidBody ) )
        }
    }

    const initializeAmmo = async () => {
        try {
            const AmmoLibrary = await window.Ammo()

            if ( !AmmoLibrary.btDefaultCollisionConfiguration ) {
                throw new Error( 'Ammo.js initialization failed.' )
            }

            const collisionConfig
                = new AmmoLibrary.btDefaultCollisionConfiguration()
            const dispatcher
                = new AmmoLibrary.btCollisionDispatcher( collisionConfig )
            const broadphase = new AmmoLibrary.btDbvtBroadphase()
            const solver = new AmmoLibrary.btSequentialImpulseConstraintSolver()
            const world = new AmmoLibrary.btDiscreteDynamicsWorld(
                dispatcher,
                broadphase,
                solver,
                collisionConfig
            )
            world.setGravity( new AmmoLibrary.btVector3( 0, SCENE.gravity, 0 ) )

            setPhysicsWorld( world )
            setAmmoLib( () => AmmoLibrary )

            animate()
        } catch ( error ) {
            console.error( 'Failed to initialize Ammo.js:', error )
        }
    }

    const updateRendererSize = () => {
        const width = window.innerWidth
        const height = window.innerHeight
        renderer.setSize( width, height )
        camera().aspect = width / height
        camera().updateProjectionMatrix()
    }

    createEffect( () => {
        initializeAmmo()
        updateRendererSize()

        window.addEventListener( 'resize', updateRendererSize )
        return () => window.removeEventListener( 'resize', updateRendererSize )
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
            <SceneContext.Provider value={store}>
                {AmmoLib() && props.children}
            </SceneContext.Provider>
        </Suspense>
    )
}

export default SceneProvider

export const useSceneContext = () => useContext( SceneContext )