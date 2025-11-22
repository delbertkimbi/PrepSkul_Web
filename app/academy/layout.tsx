"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { academySupabase } from '@/lib/academy-supabase'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Pages that don't require authentication
const publicPages = ['/academy', '/academy/signup', '/academy/login']

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()
	const [user, setUser] = useState<SupabaseUser | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			const { data: { user } } = await academySupabase.auth.getUser()
			setUser(user)
			setLoading(false)

			// Redirect to login if not authenticated and on protected page
			if (!user && !publicPages.includes(pathname)) {
				router.push('/academy/login')
			}
		}

		checkAuth()

		const { data: { subscription } } = academySupabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null)
			if (!session?.user && !publicPages.includes(pathname)) {
				router.push('/academy/login')
			}
		})

		return () => subscription.unsubscribe()
	}, [router, pathname])

	const handleLogout = async () => {
		await academySupabase.auth.signOut()
		router.push('/academy')
		router.refresh()
	}

	// Don't show layout on auth pages
	if (pathname === '/academy/signup' || pathname === '/academy/login') {
		return <>{children}</>
	}

	// Show loading state
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d3a6b] mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<div className="border-b bg-white/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Image 
							src="/app_logo(blue).png" 
							alt="PrepSkul" 
							width={33} 
							height={33} 
							className="h-8 w-8 object-contain"
						/>
						<span className="text-2xl font-black text-primary drop-shadow-md select-none" style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}>
							PrepSkul Academy
						</span>
					</div>
					{user && (
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<User size={16} />
								<span>{user.email}</span>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLogout}
								className="flex items-center gap-2"
							>
								<LogOut size={16} />
								Logout
							</Button>
						</div>
					)}
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


