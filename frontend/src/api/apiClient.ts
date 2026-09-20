const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError && error.message.trim() ? error.message : fallback;
}

interface ApiRequestOptions
  extends RequestInit {
  body?: BodyInit | null;
}

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,

      headers: {
        'Content-Type':
          'application/json',

        Accept:
          'application/json',

        ...options.headers,
      },
    },
  );

  if (!response.ok) {
    let details: unknown;

    try {
      details =
        await response.json();
    } catch {
      details =
        await response.text();
    }

    let message =
      `Request failed with status ${response.status}`;

    if (
      details &&
      typeof details === 'object' &&
      'message' in details
    ) {
      const backendMessage =
        (
          details as {
            message?: unknown;
          }
        ).message;

      if (
        typeof backendMessage
        === 'string'
      ) {
        message =
          backendMessage;
      }
    }

    throw new ApiError(
      message,
      response.status,
      details,
    );
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  const text =
    await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(
    text,
  ) as T;
}

export const apiClient = {
  get<T>(
    path: string,
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: 'GET',
      },
    );
  },

  post<
    TResponse,
    TRequest
  >(
    path: string,
    body: TRequest,
  ): Promise<TResponse> {
    return request<TResponse>(
      path,
      {
        method: 'POST',
        body:
          JSON.stringify(
            body,
          ),
      },
    );
  },

  put<
    TResponse,
    TRequest
  >(
    path: string,
    body: TRequest,
  ): Promise<TResponse> {
    return request<TResponse>(
      path,
      {
        method: 'PUT',
        body:
          JSON.stringify(
            body,
          ),
      },
    );
  },

  delete<T = void>(
    path: string,
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: 'DELETE',
      },
    );
  },

  async download(path: string, options?: { accept?: string; fallbackFileName?: string }): Promise<{ blob: Blob; fileName: string }> {
    const response = await fetch(`${API_BASE_URL}${path}`, { headers: { Accept: options?.accept ?? 'application/zip, application/json' } });
    if (!response.ok) {
      let details: unknown;
      try { details = await response.json(); } catch { details = undefined; }
      const message = details && typeof details === 'object' && 'message' in details && typeof details.message === 'string'
        ? details.message : `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, details);
    }
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    return { blob: await response.blob(), fileName: match?.[1] ?? options?.fallbackFileName ?? 'testforge-suite.zip' };
  },
};
