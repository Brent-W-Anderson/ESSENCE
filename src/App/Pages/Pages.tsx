import { Route } from '@solidjs/router'
import { lazy } from 'solid-js'
import COPY from '../../assets/COPY'
import { SceneProvider } from '../../components/_scene/SceneContext'
import style from './Pages.module.scss'

const HomePage = lazy(() => import('./HomePage/HomePage'))

const { HOME } = COPY.ROUTE

export const Pages = () => (
    <>
        <Route
            path={HOME}
            component={() => (
                <div class={style.page}>
                    {/* use a scene context provider with each new scene */}
                    <SceneProvider>
                        <HomePage />
                    </SceneProvider>
                </div>
            )}
        />
    </>
)
