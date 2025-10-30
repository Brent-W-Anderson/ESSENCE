<h3 style="font-size: 2em" align="center">
    $${\color{#9AA6B2} \text{【 ESSENCE 】}}$$
</h3>

---

<!------------------------------------------------------------------------------------->

<h3 align="center">
    $${\color{#9AA6B2} \text{FRONTEND}}$$
</h3>

<!------------------------------------------------------------------------------------->

#### $${\color{#9AA6B2} \text{REPOS}}$$

&nbsp;&nbsp;&nbsp;&nbsp;
🔹[**APP**](https://github.com/Brent-W-Anderson/ESSENCE/tree/main)
(Frontend Development) ➜ This repo contains all frontend-related code, including
UI components, styles, and client-side logic.

&nbsp;&nbsp;&nbsp;&nbsp;
🔹[**API**](https://github.com/Brent-W-Anderson/ESSENCE/tree/main/backend)
(Backend Development) ➜ This repo contains all backend-related code, including
API endpoints, database interactions, and server logic.

---

<!------------------------------------------------------------------------------------->

#### $${\color{#9AA6B2} \text{BUG FIXES/TODOs}}$$

&nbsp;&nbsp;&nbsp;&nbsp;
🔹When holding right-click to grab the screen while
moving the character with W,A,S,D and going outside of the window before
un-clicking will cause the character to keep moving in that direction until that
key is pressed again. - solution - default W,A,S,D key state back to un-pressed,
so the character stops moving when the mouse leaves the window.

&nbsp;&nbsp;&nbsp;&nbsp;
🔹Only allow left-click on canvas to select a target location to move to.

&nbsp;&nbsp;&nbsp;&nbsp;
🔹Fix bug - where player can't move around and continuously jump while holding the space-bar.

&nbsp;&nbsp;&nbsp;&nbsp;
🔹Add queueing a jump if space-bar is pressed in the middle of a jump.

&nbsp;&nbsp;&nbsp;&nbsp;
🔹Allow jumping in the middle of a ledge bump.

&nbsp;&nbsp;&nbsp;&nbsp;
🔹Fix bug - Where adjusting the rotation with cameraFloatEasing > 0 (the little bit the camera eases with the player movement causes that small little snap when starting an initial rotation).

&nbsp;&nbsp;&nbsp;&nbsp;
🔹Fix bug - Where at max zoom-out of camera, then the camera shouldn't attempt to go further.

&nbsp;&nbsp;&nbsp;&nbsp;
🔹Allow AxisArrows to drag objects around the scene.

&nbsp;&nbsp;&nbsp;&nbsp;
🔹Split up PlayerMovement component more. -start with key-bindings, since mouse-bindings are done.

&nbsp;&nbsp;&nbsp;&nbsp;
🔹Player shouldn't try and walk through objects if they're in the direct line to the target destination (add smart pathing).

&nbsp;&nbsp;&nbsp;&nbsp;
🔹Tapping shift should allow the player to lock his direction facing with the camera. A & D should now move 90 degrees sideways instead of walking towards that direction. S will walk backwards at 2/3 the speed, but still face forwards in the same direction as the camera. -mouse click alternatives can work the same way.