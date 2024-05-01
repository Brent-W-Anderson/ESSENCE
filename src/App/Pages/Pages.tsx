import { lazy } from 'solid-js'
import { Route } from '@solidjs/router'
import COPY from '../../assets/COPY'

import style from './Pages.module.scss'

const HomePage = lazy(() => import('./HomePage/HomePage'))
const LoginPage = lazy(() => import('./LoginPage/LoginPage'))

const { HOME, LOGIN } = COPY.ROUTE

export const Pages = () => (
	<>
		<Route
			path={HOME}
			component={() => <div className={style.page}>{HomePage}</div>}
		/>

		<Route
			path={LOGIN}
			component={() => <div className={style.page}>{LoginPage}</div>}
		/>
	</>
)
