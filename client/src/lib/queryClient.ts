import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Попытаемся получить JSON если возможно
    try {
      const errorData = await res.json();
      console.error(`API Error (${res.status}):`, errorData);
      throw errorData;
    } catch (e) {
      // Если не удалось получить JSON, используем текстовый ответ
      const text = await res.text() || res.statusText;
      console.error(`API Error (${res.status}):`, text);
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`API Request: ${method} ${url}`, data);
  
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log(`API Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      console.error(`API Error: ${method} ${url} failed with status ${res.status}`);
      throw res; // Просто возвращаем ответ, не бросаем исключение, так как мы будем обрабатывать его в вызывающем коде
    }
    
    return res;
  } catch (error) {
    console.error(`API Exception: ${method} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    console.log(`Query fetching: ${url}`);
    
    try {
      const res = await fetch(url, {
        credentials: "include",
      });

      console.log(`Query response: ${url} - status ${res.status}`);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Query ${url} - unauthorized, returning null`);
        return null;
      }

      if (!res.ok) {
        try {
          const errorText = await res.text();
          console.error(`Query ${url} - error:`, errorText);
          throw new Response(errorText, { status: res.status, statusText: res.statusText });
        } catch (e) {
          console.error(`Query ${url} - error parsing response:`, e);
          throw new Response(res.statusText, { status: res.status });
        }
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(`Query ${url} - exception:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
