# SOLID-JS

## FRONTEND

### TODO:

#### - AxisArrows + coordinates should be larger if they're further from the camera (zooming in-or-out should also decrease/increase font-size).

#### - allow AxisArrows to drag objects around the scene.

#### - zooming in should look at the top of the player, not the center.

#### - add settings for individual objects (on hover - shows available object settings) vs global settings on the cogwheel.

#### - split up PlayerMovement component more. -- start with key-bindings, since mouse-bindings are done.

#### - PlayerMovementPointer sometimes shows up a lot higher than it should (I think it's registering the AxisArrows, player, and possibly the ray lines).

#### - don't let the bumper lines continuously keep jumping if in range and no volicity in the z/x direction (jumping up and down continuously over ledge).

#### - when clicking a targeted location add a delay before moving to register the click (if click is being held, only delay initially).

#### - BUG: don't allow the player to hold themselves against the wall if the jump is too high (needs to slide down -- keep track of how this is done, might want to impliment this on certain terain to climb).

#### - player shouldn't try and walk through objects if they're in the direct line to the target destination (add smart pathing).

#### - tapping shift should allow the player to lock his direction facing with the camera. A & D should now move 90 degrees sideways instead of walking towards that direction. S will walk backwards at 2/3 the speed, but still face forwards in the same direction as the camera. -- mouse click alternatives can work the same way.

#### - split up PlayerMovement component more, so it's easier to read.

#### - disable ray lines at the height of a jump, since velocity is 0 (bug when jumping up to a ledge and ray lines re-adjust). -- possibly keep this for grabbing ledges...
