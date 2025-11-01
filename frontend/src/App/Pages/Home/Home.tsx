import { Component, Suspense } from 'solid-js'

const HomePage: Component = () => {
    return (
        <Suspense
            fallback={
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            }
        >
            <h1> HOMEPAGE </h1>
        </Suspense>
    )
}

export default HomePage