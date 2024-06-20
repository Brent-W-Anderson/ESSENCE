declare module 'stats-js' {
    export default class Stats {
        constructor()
        showPanel(type: number): void
        begin(): void
        end(): void
        dom: HTMLDivElement
    }
}
