import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-brand-600 dark:text-brand-400 text-sm font-semibold">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link
        href="/"
        className="bg-brand-600 hover:bg-brand-700 rounded-full px-5 py-2 text-sm font-medium text-white transition"
      >
        Back to the dashboard
      </Link>
    </main>
  );
}
