import { Accessor, Setter } from 'solid-js'
import {
    Group,
    Mesh,
    PerspectiveCamera,
    Scene,
    WebGLRenderer
} from 'three'

export interface SceneContextProps {
    scene: Scene
    camera: PerspectiveCamera
    renderer: WebGLRenderer
    updateMesh: (
        mesh: Group|Mesh,
        rigidBody: Window['Ammo']['btRigidBody']
    ) => void
    createRigidBody: (
        mesh: Group|Mesh,
        mass: number,
        size: { width: number; height: number; depth: number }
    ) => Window['Ammo']['btRigidBody']|undefined
    physicsWorld?: () => Window['Ammo']['btDiscreteDynamicsWorld']|undefined
    AmmoLib: Accessor<typeof window.Ammo|undefined>
    rigidPlayerRef?: Accessor<Window['Ammo']['btRigidBody']|undefined>
    setRigidPlayerRef?: Setter<Window['Ammo']['btRigidBody']|undefined>
    playerRef?: Accessor<Group|Mesh|undefined>
    setPlayerRef?: Setter<Group|Mesh|undefined>
    floorRef?: Accessor<Mesh|undefined>
    setFloorRef?: Setter<Mesh|undefined>
    objectsRef?: Accessor<
        {
            index: number
            mesh: Mesh
        }[]
    >
    setObjectsRef?: Setter<
        {
            index: number
            mesh: Mesh
        }[]
    >
}
