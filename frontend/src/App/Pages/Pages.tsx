import { Route } from '@solidjs/router'
import { lazy, Suspense } from 'solid-js'
import style from './Pages.module.scss'
import COPY from '@/assets/COPY'

const HomePage = lazy(() => import('./Home/Home'))
const SceneProvider = lazy(() => import('@/components/_Scene/Context'))

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
