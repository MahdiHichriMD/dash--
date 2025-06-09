import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

export function useAuthenticatedQuery<T>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  const { token } = useAuth();

  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!token,
    ...options
  });
}