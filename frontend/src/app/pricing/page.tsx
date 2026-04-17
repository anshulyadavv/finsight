'use client';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFC] text-gray-900 font-sans overflow-x-hidden selection:bg-violet-200 selection:text-violet-900 relative">
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')" }} />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 blur-[120px] mix-blend-multiply" />
         <div className="absolute top-[20%] right-[-5%] w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-emerald-300/20 to-teal-200/20 blur-[130px] mix-blend-multiply" />
      </div>

      <header className="relative z-50 pt-8 px-6">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto pointer-events-auto">
          <Link href="/" className="z-10 group focus:outline-none">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-8 z-10">
            <Link href="/login" className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full text-[15px] font-bold transition-colors">Login</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[800px] mx-auto pt-32 pb-32 px-6">
        <h1 className="text-[48px] md:text-[64px] font-black tracking-tight text-gray-900 mb-6 capitalize">Pricing</h1>
        <div className="bg-white rounded-[32px] p-10 border border-gray-200 shadow-sm relative overflow-hidden">
          <p className="text-[18px] text-gray-600 font-medium leading-relaxed">
            Content for Pricing coming soon. This page is currently under development to bring you the premium FinSight experience.
          </p>
        </div>
      </main>
    </div>
  );
}
