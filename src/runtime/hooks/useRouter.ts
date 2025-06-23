import { useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  return useMemo(() => ({
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    params,
    pathname: location.pathname,
    query: new URLSearchParams(location.search),
  }), [params, location, navigate]);
}