import { Component, onCleanup } from 'solid-js'
import Stats from 'stats-js'

// TODO: move style to .scss file.

const PerformanceStats: Component = () => {
    const statsInstances: Stats[] = []

    const createStatsInstance = (panel: number, position: string) => {
        const stats = new Stats()
        stats.showPanel(panel)
        stats.dom.style.cssText = `position:fixed;bottom:96px;left:${position};transform:scale(2);pointer-events:none;`
        statsInstances.push(stats)

        return stats.dom
    }

    const statsElements = [
        createStatsInstance(0, '0px'),
        createStatsInstance(1, '160px'),
        createStatsInstance(2, '320px')
    ]

    // Update stats on each frame
    const animate = () => {
        statsInstances.forEach(stats => stats.begin())
        statsInstances.forEach(stats => stats.end())
        requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)

    onCleanup(() => {
        statsInstances.forEach(stats => stats.dom.remove())
    })

    return (
        <>
            {statsElements.map(element => (
                <div ref={el => el?.appendChild(element)}></div>
            ))}
        </>
    )
}

export default PerformanceStats
