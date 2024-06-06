# SOLID-JS

## TODO:

### - stop rotation when holding right-click and only add/subtract the amount of rotation applied by the mouse, since the click started.

### - disable ray lines at the height of a jump, since velocity is 0 (bug when jumping up to a ledge and ray lines re-adjust).

### - clicking a targeted location should work on top of objects (just walk underneat).

### - when clicking a targeted location add a delay before moving to register the click (if click is being held, only delay initially).

### - BUG: don't allow the player to hold themselves against the wall if the jump is too high (needs to slide down).

### - player shouldn't try and walk through objects if they're in the direct line to the target destination.

### - add variable to disable seeing the bumper ray lines.

### - split up PlayerMovement component, so it's easier to read.
