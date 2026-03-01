import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 40%, rgba(59,130,246,0.06) 0%, transparent 70%)',
        }}
      />

      <p className="relative text-[8rem] font-extrabold leading-none tracking-tighter text-slate-800 md:text-[12rem]">
        404
      </p>

      <h1 className="relative mt-4 text-2xl font-bold text-white md:text-3xl">
        This page doesn&apos;t exist yet.
      </h1>

      <p className="relative mt-2 text-slate-400">
        Try searching for a product or brand below.
      </p>

      <div className="relative mt-8 w-full max-w-lg">
        <SearchBar autoFocus />
      </div>

      <Link
        href="/"
        className="relative mt-8 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        ← Back to homepage
      </Link>
    </div>
  );
}
