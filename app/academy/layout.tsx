"use client"

import Image from 'next/image';

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<div className="border-b bg-white/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Image 
							src="/logo.jpg" 
							alt="PrepSkul Logo" 
							width={40} 
							height={40} 
							className="rounded-lg object-contain"
						/>
						<div className="text-xl sm:text-2xl font-bold text-primary drop-shadow-md select-none">PrepSkul</div>
					</div>
					{/* Desktop nav */}
					
				</div>
			</div>
			<main className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 flex-1">{children}</main>
			<footer className="border-t bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/50 mt-auto">
				<div className="container mx-auto px-2 sm:px-4 py-6 text-xs text-muted-foreground text-center">
					© {new Date().getFullYear()} PrepSkul Academy
				</div>
			</footer>
		</div>
	);
}


