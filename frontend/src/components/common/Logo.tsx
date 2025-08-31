import { cn } from '@/lib/utils'

interface LogoProps {
	size?: 'sm' | 'md' | 'lg' | 'xl'
	variant?: 'default' | 'white' | 'colored'
	className?: string
	showText?: boolean
}

const Logo: React.FC<LogoProps> = ({
	size = 'md',
	className,
	showText = true,
}) => {
	const sizes = {
		sm: 'w-6 h-6',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
		xl: 'w-16 h-16',
	}

	return (
		<div className={cn('flex items-center gap-2', className)}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				aria-label='Go'
				role='img'
				viewBox='0 0 512 512'
				className={cn(sizes[size])}>
				<rect width='512' height='512' rx='15%' fill='transparent' />
				<path
					fill={'#00acd7'}
					d='M308 220c1 2-1 2-2 2l-34 9c-3 2-5-1-5-1-21-26-65-8-67 30-2 36 45 50 67 14h-38c-3 0-8-1-3-10l8-17c2-4 3-4 9-4h70c0 81-90 117-138 68-22-23-29-75 16-112 36-29 96-29 117 21m16 96c-45-39-21-120 50-133 73-13 105 55 76 106-24 43-88 61-126 27m94-51c9-25-9-49-36-47-30 3-51 42-32 65 19 22 58 12 68-18m-321-2v-1l2-5 2-1h41l1 1-1 5-1 1H97m-48-18s-2 0-1-1l4-6 2-1h92l1 1-2 5-1 1-95 1m30-19l-1-1 5-5 2-1h72v1l-3 5-2 1H79'
				/>
			</svg>
			{showText && (
				<span
					className={cn(
						'font-semibold',
						size === 'sm'
							? 'text-sm'
							: size === 'lg'
							? 'text-lg'
							: size === 'xl'
							? 'text-xl'
							: 'text-base',
					)}>
					Платформа изучения Go
				</span>
			)}
		</div>
	)
}

export default Logo
