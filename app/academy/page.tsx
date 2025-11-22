"use client"

import { ACADEMY_LEVELS } from "@/lib/academy-data"
import { loadProgress, PASS_THRESHOLD } from "@/lib/academy-storage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { BookOpen, Award, Users, Target, TrendingUp, CheckCircle2, Sparkles } from "lucide-react"

export default function AcademyDashboard() {
	const progress = loadProgress()
	const { scrollYProgress } = useScroll()
	const heroRef = useRef<HTMLDivElement>(null)
	const [isVisible, setIsVisible] = useState(false)

	// Transform values for parallax effects
	const heroY = useTransform(scrollYProgress, [0, 1], [0, -100])
	const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

	useEffect(() => {
		setIsVisible(true)
	}, [])

	// Module descriptions with user-friendly context
	const moduleDescriptions: Record<string, string> = {
		nursery: "Perfect for educators working with little ones aged 3-5. Learn how to create magical learning experiences through play, songs, and stories that spark curiosity and build strong foundations.",
		primary: "Master the art of teaching children aged 6-11. From phonics to problem-solving, discover proven methods that make learning engaging and help every child succeed in their educational journey.",
		secondary: "Take your teaching to the next level. Learn advanced strategies for subject-depth instruction, exam preparation, and helping teenagers reach their full academic potential."
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
			{/* Hero Section with Enhanced Animations */}
			<motion.div 
				ref={heroRef}
				style={{ y: heroY, opacity: heroOpacity }}
				className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 pt-20 pb-32 overflow-hidden bg-gradient-to-br from-[#2d3a6b] via-[#252f57] to-[#1a2340]"
			>
				{/* Animated Background Elements */}
				<div className="absolute inset-0 z-0">
					<div className="absolute inset-0 bg-gradient-to-b from-[#2d3a6b] to-[#252f57]"></div>
					{/* Floating particles effect */}
					{[...Array(15)].map((_, i) => {
						const positions = [
							{ x: '10%', y: '20%' }, { x: '30%', y: '15%' }, { x: '50%', y: '25%' },
							{ x: '70%', y: '18%' }, { x: '90%', y: '22%' }, { x: '15%', y: '50%' },
							{ x: '35%', y: '45%' }, { x: '55%', y: '55%' }, { x: '75%', y: '48%' },
							{ x: '85%', y: '52%' }, { x: '20%', y: '75%' }, { x: '40%', y: '80%' },
							{ x: '60%', y: '78%' }, { x: '80%', y: '82%' }, { x: '25%', y: '60%' }
						]
						const pos = positions[i] || { x: `${(i * 7) % 100}%`, y: `${(i * 11) % 100}%` }
						return (
							<motion.div
								key={i}
								className="absolute w-2 h-2 bg-white/10 rounded-full"
								style={{ left: pos.x, top: pos.y }}
								initial={{ opacity: 0, scale: 0 }}
								animate={{
									opacity: [0, 0.6, 0],
									scale: [0, 1, 0],
									y: [0, -30, -60],
								}}
								transition={{
									duration: 3 + (i % 3),
									repeat: Infinity,
									delay: (i * 0.2) % 2,
									ease: "easeInOut"
								}}
							/>
						)
					})}
					{/* Wave Background */}
					<svg className="absolute bottom-0 w-full h-40" viewBox="0 0 1200 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
						<path fill="rgba(255,255,255,0.05)" d="M0,224L48,213.3C96,203,192,181,288,165.3C384,149,480,139,576,154.7C672,171,768,213,864,213.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
					</svg>
				</div>

				{/* Content */}
				<div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div 
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="max-w-4xl mx-auto text-center"
					>
						<motion.div
							initial={{ scale: 0.9 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
								PrepSkul <span className="text-blue-300">Academy</span>
							</h1>
						</motion.div>
						<motion.p 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.4 }}
							className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-4 font-semibold drop-shadow-lg"
						>
							Ensuring Excellence in Education
						</motion.p>
						<motion.p 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.6 }}
							className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md"
						>
							Transform your teaching career with our comprehensive training platform. Master proven methodologies, earn recognized certifications, and become the <span className="font-bold text-blue-300">educator your students deserve</span>.
						</motion.p>
					</motion.div>
				</div>
			</motion.div>

			{/* What is PrepSkul Academy Section */}
			<motion.section
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-100px" }}
				transition={{ duration: 0.8 }}
				className="max-w-6xl mx-auto px-4 py-16 sm:py-20"
			>
				<div className="text-center mb-12">
					<motion.h2 
						initial={{ opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900"
					>
						What is <span className="text-[#2d3a6b]">PrepSkul Academy</span>?
					</motion.h2>
					<motion.p 
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
					>
						PrepSkul Academy is your gateway to becoming an <span className="font-semibold text-[#2d3a6b]">exceptional educator</span>. We provide structured, interactive training modules that cover everything from early childhood development to advanced teaching strategies. Our platform combines <span className="font-semibold text-[#2d3a6b]">theory with practical application</span>, ensuring you're ready to make a real difference in your classroom.
					</motion.p>
				</div>

				{/* Feature Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
					{[
						{ icon: BookOpen, title: "Structured Learning", desc: "Step-by-step modules designed by education experts" },
						{ icon: Award, title: "Earn Certificates", desc: "Get recognized for your commitment to professional growth" },
						{ icon: Users, title: "Real-World Ready", desc: "Learn strategies you can apply immediately in your classroom" }
					].map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.2 }}
							className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1"
						>
							<feature.icon className="w-12 h-12 text-[#2d3a6b] mb-4" />
							<h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
							<p className="text-gray-600">{feature.desc}</p>
						</motion.div>
					))}
				</div>
			</motion.section>

			{/* Why Choose PrepSkul Academy */}
			<motion.section
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true, margin: "-100px" }}
				className="bg-gradient-to-br from-[#2d3a6b] to-[#252f57] py-16 sm:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
			>
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-12"
					>
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
							Why Choose <span className="text-blue-300">PrepSkul Academy</span>?
						</h2>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{[
							{
								icon: Target,
								title: "Focused Curriculum",
								desc: "Every module is carefully crafted to address real challenges you face in the classroom. No fluff, just practical knowledge that works."
							},
							{
								icon: TrendingUp,
								title: "Track Your Progress",
								desc: "See your growth in real-time with detailed progress tracking. Know exactly where you are and what comes next."
							},
							{
								icon: CheckCircle2,
								title: "Interactive Quizzes",
								desc: "Test your understanding with engaging quizzes that reinforce learning and prepare you for real teaching scenarios."
							},
							{
								icon: Sparkles,
								title: "Modern Methodology",
								desc: "Learn the latest teaching techniques aligned with Cameroon's CBC curriculum and international best practices."
							}
						].map((benefit, index) => (
							<motion.div
								key={benefit.title}
								initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.15 }}
								className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-all"
							>
								<benefit.icon className="w-10 h-10 text-blue-300 mb-4" />
								<h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
								<p className="text-white/90">{benefit.desc}</p>
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>


			{/* Call to Action Section */}
			<motion.section
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true, margin: "-100px" }}
				className="bg-gradient-to-r from-[#2d3a6b] via-[#252f57] to-[#2d3a6b] py-16 sm:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
			>
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
							Ready to Transform Your <span className="text-blue-300">Teaching Career</span>?
						</h2>
						<p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
							Join thousands of educators who are already making a difference. Start your journey today and unlock your full potential as a teacher.
						</p>
						<motion.div
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Button 
								size="lg" 
								asChild
								className="px-8 py-6 text-lg bg-white text-[#2d3a6b] hover:bg-blue-50 font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all"
							>
								<a href="/academy/signup">Get Started Now</a>
							</Button>
						</motion.div>
					</motion.div>
				</div>
			</motion.section>

			{/* Final Info Section */}
			<motion.section
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true, margin: "-100px" }}
				className="max-w-6xl mx-auto px-4 py-16 sm:py-20"
			>
				<div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 sm:p-12 shadow-xl border border-gray-200">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center"
					>
						<h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
							Your Success is Our <span className="text-[#2d3a6b]">Mission</span>
						</h3>
						<p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
							At PrepSkul Academy, we believe that <span className="font-semibold text-[#2d3a6b]">great teachers create great futures</span>. Our platform is designed to support you every step of the way, from your first module to earning your certification. Whether you're just starting out or looking to refine your skills, we're here to help you become the <span className="font-semibold text-[#2d3a6b]">educator you've always wanted to be</span>.
						</p>
					</motion.div>
				</div>
			</motion.section>
		</div>
	)
}
