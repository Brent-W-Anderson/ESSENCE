import { Route } from '@solidjs/router'
import { lazy, Suspense } from 'solid-js'
import COPY from '@/assets/COPY'
import style from './Pages.module.scss'

const HomePage = lazy(() => import('./HomePage/HomePage'))
const SceneProvider = lazy(() => import('@/components/_Scene/SceneContext'))

const { HOME } = COPY.ROUTE

const Pages = () => (
    <Suspense
        fallback={
            <div class="loading">
                <div class="spinner"></div>
            </div>
        }
    >
        <Route
            path={HOME}
            component={() => (
                <div class={style.page}>
                    <SceneProvider>
                        <HomePage />
                    </SceneProvider>
                </div>
            )}
        />
    </Suspense>
)

export default Pages
