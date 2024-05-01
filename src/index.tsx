import { render } from 'solid-js/web'
import { Nav } from './App/Nav'
import { Pages } from './App/Pages/Pages'
import { Router } from '@solidjs/router'

const root = document.getElementById('app') as HTMLElement

const App = () => (
	<Router root={Nav}>
		<Pages />
	</Router>
)

render(App, root)
