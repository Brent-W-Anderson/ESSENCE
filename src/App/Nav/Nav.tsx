import { JSX } from 'solid-js'
import COPY from '../../assets/COPY'
import style from './Nav.module.scss'

const { ROUTE, NAV } = COPY

export const Nav = ({
    children
}: {
    children?: JSX.Element | JSX.Element[]
}) => (
    <>
        <nav id={style.NAV}>
            <a href={ROUTE.HOME}>{NAV.HOME}</a>
            <a href={ROUTE.LOGIN}>{NAV.LOGIN}</a>
        </nav>

        {children}
    </>
)
