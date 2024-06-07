# SOLID-JS

## TODO:

### - add context to playterMovement, so there's not so much prop drilling.

### - don't let the bumper lines continuously keep jumping if in range and no volicity in the z/x direction.

### - PlayerMovementPointer sometimes shows up a lot higher than it should.

### - when clicking a targeted location add a delay before moving to register the click (if click is being held, only delay initially).

### - BUG: don't allow the player to hold themselves against the wall if the jump is too high (needs to slide down).

### - player shouldn't try and walk through objects if they're in the direct line to the target destination (add pathing).

### - holding shift should allow the player to lock his direction facing with the camera. A & D should now move 90 degrees sideways instead of walking towards that direction. S will walk backwards at 2/3 the speed, but still face forwards in the same direction as the camera.

### - add variable to disable seeing the bumper ray lines.

### - split up PlayerMovement component more, so it's easier to read.

### - disable ray lines at the height of a jump, since velocity is 0 (bug when jumping up to a ledge and ray lines re-adjust). -- possibly keep this for grabbing ledges...
