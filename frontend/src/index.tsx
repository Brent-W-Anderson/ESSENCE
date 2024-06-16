import { Router } from '@solidjs/router'
import { lazy } from 'solid-js'
import { Suspense, render } from 'solid-js/web'

const Nav = lazy(() => import('./App/Nav/Nav'))
const Pages = lazy(() => import('./App/Pages/Pages'))

const root = document.createElement('div')
root.id = 'APP'

document.body.innerHTML = ''
document.body.appendChild(root)

const App = () => (
    <Suspense
        fallback={
            <div class="loading">
                <div class="spinner"></div>
            </div>
        }
    >
        <Router root={Nav}>
            <Pages />
        </Router>
    </Suspense>
)

render(App, root)
