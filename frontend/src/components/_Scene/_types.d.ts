import { Accessor, Setter } from 'solid-js'
import { Group, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

export interface SceneContextProps {
    AmmoLib: Accessor<typeof window.Ammo | undefined>
    camera: Accessor<PerspectiveCamera>
    createRigidBody: (
        mesh: Group | Mesh,
        mass: number,
        size: { depth: number; height: number; width: number; }
    ) => Window['Ammo']['btRigidBody'] | undefined
    floorRef?: Accessor<Mesh | undefined>
    objectsRef?: Accessor<
        {
            index: number
            mesh: Mesh
        }[]
    >
    physicsWorld?: () => Window['Ammo']['btDiscreteDynamicsWorld'] | undefined
    playerRef?: Accessor<Group | Mesh | undefined>
    renderer: WebGLRenderer
    rigidPlayerRef?: Accessor<Window['Ammo']['btRigidBody'] | undefined>
    scene: Scene
    setFloorRef?: Setter<Mesh | undefined>
    setObjectsRef?: Setter<
        {
            index: number
            mesh: Mesh
        }[]
    >
    setPlayerRef?: Setter<Group | Mesh | undefined>
    setRigidPlayerRef?: Setter<Window['Ammo']['btRigidBody'] | undefined>
    updateMesh: (
        mesh: Group | Mesh,
        rigidBody: Window['Ammo']['btRigidBody']
    ) => void
}