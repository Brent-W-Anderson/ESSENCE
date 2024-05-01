import { Router } from '@solidjs/router'
import { render } from 'solid-js/web'
import { Nav } from './App/Nav/Nav'
import { Pages } from './App/Pages/Pages'
import './index.scss'

const root = document.getElementById('app') as HTMLElement

const App = () => (
    <Router root={Nav}>
        <Pages />
    </Router>
)

render(App, root)
