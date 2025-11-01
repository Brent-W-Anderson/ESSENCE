import { Route } from '@solidjs/router'
import { lazy, Suspense } from 'solid-js'
import style from './Pages.module.scss'
import COPY from '@/assets/COPY'

const GamePage = lazy( () => import( './Game/Game' ) )
const HomePage = lazy( () => import( './Home/Home' ) )
const SceneProvider = lazy( () => import( '@/components/_Scene/Context' ) )

const { HOME, GAME } = COPY.ROUTE

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
                    <HomePage />
                </div>
            )}
        />

        <Route
            path={GAME}
            component={() => (
                <div class={style.page}>
                    <SceneProvider>
                        <div />
                        <GamePage />
                    </SceneProvider>
                </div>
            )}
        />
    </Suspense>
)

export default Pages