import { Route } from '@solidjs/router'
import { lazy } from 'solid-js'
import COPY from '../../assets/COPY'
import style from './Pages.module.scss'

const HomePage = lazy(() => import('./HomePage/HomePage'))
const LoginPage = lazy(() => import('./LoginPage/LoginPage'))

const { HOME, LOGIN } = COPY.ROUTE

export const Pages = () => (
    <>
        <Route
            path={HOME}
            component={() => (
                <div class={style.page}>
                    <HomePage />
                </div>
            )}
        />

        <Route
            path={LOGIN}
            component={() => (
                <div class={style.page}>
                    <LoginPage />
                </div>
            )}
        />
    </>
)
