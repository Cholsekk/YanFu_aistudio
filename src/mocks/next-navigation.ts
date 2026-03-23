import { useState, useEffect } from 'react';

export function useRouter() {
  return {
    push: (url: string) => {
      window.history.pushState({}, '', url);
      window.dispatchEvent(new Event('popstate'));
    },
    replace: (url: string) => {
      window.history.replaceState({}, '', url);
      window.dispatchEvent(new Event('popstate'));
    },
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  };
}

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return pathname;
}

export function useSearchParams() {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handleLocationChange = () => setSearchParams(new URLSearchParams(window.location.search));
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return searchParams;
}

export function useParams() {
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/api-doc/')) {
        const appId = pathname.split('/')[2];
        setParams({ appId });
      } else {
        setParams({});
      }
    };
    
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return params;
}
