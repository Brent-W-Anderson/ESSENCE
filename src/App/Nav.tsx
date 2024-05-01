import { JSX } from 'solid-js'
import COPY from '../assets/COPY'

const { ROUTE, NAV } = COPY

export const Nav = ({
	children,
}: {
	children?: JSX.Element | JSX.Element[]
}) => (
	<>
		<nav>
			<a href={ROUTE.HOME}>{NAV.HOME}</a>
			<a href={ROUTE.LOGIN}>{NAV.LOGIN}</a>
		</nav>

		{children}
	</>
)
