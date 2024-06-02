import * as Ammo from 'ammojs3'
import {
    createContext,
    useContext,
    Component,
    createSignal,
    createEffect,
    ComponentProps,
    Accessor
} from 'solid-js'
import * as THREE from 'three'

interface SceneContextType {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    updateMesh: (
        mesh: THREE.Group | THREE.Mesh,
        rigidBody: Ammo.default.btRigidBody
    ) => void
    createRigidBody: (
        mesh: THREE.Group | THREE.Mesh,
        mass: number,
        size: { width: number; height: number; depth: number }
    ) => Ammo.default.btRigidBody
    physicsWorld?: () => Ammo.default.btDiscreteDynamicsWorld | undefined
    AmmoLib: Accessor<typeof Ammo.default>
}

const SceneContext = createContext<SceneContextType>()

export const SceneProvider: Component<ComponentProps<any>> = props => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )
    camera.position.set(5, 10, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)

    const [physicsWorld, setPhysicsWorld] =
        createSignal<Ammo.default.btDiscreteDynamicsWorld>()
    const [AmmoLib, setAmmoLib] = createSignal<any>()

    const animate = () => {
        requestAnimationFrame(animate)

        if (physicsWorld()) {
            physicsWorld()?.stepSimulation(1 / 60, 10)
        }

        renderer.render(scene, camera)
    }

    const createRigidBody = (
        mesh: THREE.Group | THREE.Mesh,
        mass: number,
        size: { width: number; height: number; depth: number }
    ) => {
        const ammo = AmmoLib()

        if (ammo) {
            const shape = new ammo.btBoxShape(
                new ammo.btVector3(size.width, size.height, size.depth)
            )
            shape.setMargin(0)

            const transform = new ammo.btTransform()
            const quaternion = mesh.quaternion
            transform.setIdentity()
            transform.setRotation(
                new ammo.btQuaternion(
                    quaternion.x,
                    quaternion.y,
                    quaternion.z,
                    quaternion.w
                )
            )
            transform.setOrigin(
                new ammo.btVector3(
                    mesh.position.x,
                    mesh.position.y,
                    mesh.position.z
                )
            )
            const motionState = new ammo.btDefaultMotionState(transform)
            const localInertia = new ammo.btVector3(0, 0, 0)
            shape.calculateLocalInertia(mass, localInertia)

            const rbInfo = new ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                shape,
                localInertia
            )
            const body = new ammo.btRigidBody(rbInfo)

            return body
        }
    }

    const updateMesh = (
        mesh: THREE.Group | THREE.Mesh,
        rigidBody: Ammo.default.btRigidBody
    ) => {
        const ammo = AmmoLib()

        if (ammo) {
            const transform = new ammo.btTransform()
            rigidBody?.getMotionState().getWorldTransform(transform)

            const origin = transform.getOrigin()
            const rotation = transform.getRotation()

            mesh.position.set(origin.x(), origin.y(), origin.z())
            mesh.quaternion.set(
                rotation.x(),
                rotation.y(),
                rotation.z(),
                rotation.w()
            )

            requestAnimationFrame(() => updateMesh(mesh, rigidBody))
        }
    }

    const initializeAmmo = async () => {
        try {
            const AmmoLibrary = await Ammo.default()

            if (!AmmoLibrary.btDefaultCollisionConfiguration) {
                throw new Error('Ammo.js initialization failed.')
            }

            const collisionConfiguration =
                new AmmoLibrary.btDefaultCollisionConfiguration()
            const dispatcher = new AmmoLibrary.btCollisionDispatcher(
                collisionConfiguration
            )
            const broadphase = new AmmoLibrary.btDbvtBroadphase()
            const solver = new AmmoLibrary.btSequentialImpulseConstraintSolver()
            const world = new AmmoLibrary.btDiscreteDynamicsWorld(
                dispatcher,
                broadphase,
                solver,
                collisionConfiguration
            )
            world.setGravity(new AmmoLibrary.btVector3(0, -9.81, 0))

            setPhysicsWorld(world)
            setAmmoLib(AmmoLibrary)

            animate()
        } catch (error) {
            console.error('Failed to initialize Ammo.js:', error)
        }
    }

    const updateRendererSize = () => {
        const width = window.innerWidth
        const height = window.innerHeight
        renderer.setSize(width, height)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
    }

    createEffect(() => {
        initializeAmmo()
        updateRendererSize()
    })

    createEffect(() => {
        window.addEventListener('resize', updateRendererSize)
        return () => window.removeEventListener('resize', updateRendererSize)
    })

    const store = {
        scene,
        camera,
        renderer,
        physicsWorld,
        createRigidBody,
        updateMesh,
        AmmoLib
    }

    return (
        <SceneContext.Provider value={store}>
            {AmmoLib() && props.children}
        </SceneContext.Provider>
    )
}

export const useSceneContext = () => useContext(SceneContext)
