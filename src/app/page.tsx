import { Dashboard } from '@/components/weather/dashboard';

/**
 * The dashboard itself is a client component because every meaningful piece of
 * it — units, saved places, theme, live refresh — is per-visitor state. The
 * server's only job is to hand it the starting location.
 */
export default function HomePage() {
  const defaultQuery =
    process.env.NEXT_PUBLIC_DEFAULT_LOCATION?.trim() || 'Sriperumbudur';

  return (
    <div id="main">
      <Dashboard defaultQuery={defaultQuery} defaultLabel={defaultQuery} />
    </div>
  );
}
