import { JSX } from 'solid-js'
import style from './Nav.module.scss'
import COPY from '@/assets/COPY'

const { ROUTE, NAV } = COPY

const Nav = ({ children }: { children?: JSX.Element | JSX.Element[] }) => (
    <>
        <nav id={style.NAV}>
            <a href={ROUTE.HOME}>{NAV.HOME}</a>
            <div class={style.icon}>{NAV.SETTINGS()}</div>
        </nav>

        {children}
    </>
)

export default Nav
