// import Link from 'next/link'
// import Image from 'next/image'

// export default function NotFound() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center px-4">
//       <div className="max-w-2xl w-full text-center">
//         {/* Logo */}
//         <div className="flex justify-center mb-8">
//           <div className="flex items-center gap-3">
//             <Image
//               src="/app_logo(white).png"
//               alt="PrepSkul"
//               width={64}
//               height={64}
//               className="h-16 w-16 object-contain"
//               priority
//             />
//             <span className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}>
//               PrepSkul
//             </span>
//           </div>
//         </div>

//         {/* 404 Content */}
//         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20">
//           <h1 className="text-9xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}>
//             404
//           </h1>
//           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}>
//             Page Not Found (404)
//           </h2>
//           <p className="text-white/90 text-lg mb-8">
//             The page you're looking for doesn't exist or has been moved.
//           </p>
          
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               href="/"
//               className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors duration-200 shadow-lg"
//             >
//               Go Home
//             </Link>
//             <Link
//               href="/tutors"
//               className="inline-flex items-center justify-center px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors duration-200 border border-white/30"
//             >
//               Find Tutors
//             </Link>
//           </div>
//         </div>
