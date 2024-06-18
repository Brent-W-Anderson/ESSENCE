# SOLID-JS

## FRONTEND

### TODO:

#### - allow jumping in the middle of a ledge bump.

#### - add queueing a jump if space-bar is pressed in the middle of a jump.

#### - allow AxisArrows to drag objects around the scene.

#### - zooming in should look at the top of the player, not the center.

#### - AxisArrows + coordinates should be larger if they're further from the camera (zooming in-or-out should also decrease/increase font-size).

#### - split up PlayerMovement component more. -- start with key-bindings, since mouse-bindings are done.

#### - player shouldn't try and walk through objects if they're in the direct line to the target destination (add smart pathing).

#### - tapping shift should allow the player to lock his direction facing with the camera. A & D should now move 90 degrees sideways instead of walking towards that direction. S will walk backwards at 2/3 the speed, but still face forwards in the same direction as the camera. -- mouse click alternatives can work the same way.

#### - disable ray lines at the height of a jump, since velocity is 0 (bug when jumping up to a ledge and ray lines re-adjust). -- possibly keep this for grabbing ledges...
