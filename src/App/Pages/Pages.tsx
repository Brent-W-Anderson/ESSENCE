import { lazy } from 'solid-js'
import { Route } from '@solidjs/router'
import COPY from '../../assets/COPY'

const HomePage = lazy(() => import('./HomePage/HomePage'))
const LoginPage = lazy(() => import('./LoginPage/LoginPage'))

const { HOME, LOGIN } = COPY.ROUTE

export const Pages = () => (
	<>
		<Route path={HOME} component={HomePage} />
		<Route path={LOGIN} component={LoginPage} />
	</>
)
