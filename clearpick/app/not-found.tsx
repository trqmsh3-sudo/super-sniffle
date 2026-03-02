import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-bg px-4">
      <p className="text-[8rem] font-extrabold leading-none tracking-tighter text-gray-100 md:text-[12rem]">
        404
      </p>

      <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
        This page doesn&apos;t exist yet.
      </h1>

      <p className="mt-2 text-gray-500">
        Try searching for a product or brand below.
      </p>

      <div className="mt-8 w-full max-w-lg">
        <SearchBar autoFocus />
      </div>

      <Link
        href="/"
        className="mt-8 text-sm font-medium text-accent transition-colors hover:text-primary-800"
      >
        ← Back to homepage
      </Link>
    </div>
  );
}
