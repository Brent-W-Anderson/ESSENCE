import { Router } from '@solidjs/router'
import { render } from 'solid-js/web'
import { Nav } from './App/Nav/Nav'
import { Pages } from './App/Pages/Pages'
import './index.scss'

const root = document.createElement('div')
root.id = 'app'
document.body.appendChild(root)

const App = () => (
    <Router root={Nav}>
        <Pages />
    </Router>
)

render(App, root)
