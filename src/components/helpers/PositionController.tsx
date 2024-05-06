import * as THREE from 'three'

class PositionController {
    private objects: { [name: string]: THREE.Object3D } = {}

    addObject(name: string, object: THREE.Object3D) {
        this.objects[name] = object
    }

    removeObject(name: string) {
        delete this.objects[name]
    }

    setPosition(name: string, position: THREE.Vector3) {
        const object = this.objects[name]
        if (object) {
            object.position.copy(position)
        }
    }

    getPosition(name: string): THREE.Vector3 | null {
        const object = this.objects[name]
        return object ? object.position : null
    }
}

const positionController = new PositionController()

export default positionController
