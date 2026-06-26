import { Link } from 'react-router-dom';

const menuItems = ['Booking', 'Package', 'Planner', 'Suggest', 'Util', 'About'];

const routePrefetchers = {
  booking: () => import('@/pages/BookingPage'),
  package: () => import('@/pages/PackagePage'),
  planner: () => import('@/pages/PlannerPage'),
  suggest: () => import('@/pages/SuggestPage'),
  util: () => import('@/pages/UtilPage'),
  about: () => import('@/pages/AboutPage'),
};

const prefetchedRoutes = new Set();

const prefetchRoute = (path) => {
  if (prefetchedRoutes.has(path)) {
    return;
  }

  const prefetcher = routePrefetchers[path];
  if (!prefetcher) {
    return;
  }

  prefetchedRoutes.add(path);
  prefetcher().catch(() => {
    prefetchedRoutes.delete(path);
  });
};

const Navigation = ({ isMobile = false, onLinkClick = () => {} }) => {
  if (isMobile) {
    return (
      <nav className="flex flex-col items-center justify-center gap-5 mt-8">
        {menuItems.map((item) => {
          const path = item.toLowerCase();

          return (
            <Link
              key={item}
              to={`/${path}`}
              onClick={onLinkClick}
              onMouseEnter={() => prefetchRoute(path)}
              onFocus={() => prefetchRoute(path)}
              onTouchStart={() => prefetchRoute(path)}
              className="border border-gray-500 px-6 py-3 rounded-full text-base font-semibold hover:bg-gray-100 transition w-48 text-center"
            >
              {item}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="hidden sm:flex gap-8 font-semibold text-lg">
      {menuItems.map((item) => {
        const path = item.toLowerCase();

        return (
          <Link
            key={item}
            to={`/${path}`}
            onMouseEnter={() => prefetchRoute(path)}
            onFocus={() => prefetchRoute(path)}
            className="hover:text-blue-500 transition"
          >
            {item}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
