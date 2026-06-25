// ---------------------------------------------------------------------------
// Fastify request augmentation — attached after session validation
// ---------------------------------------------------------------------------

export interface AuthUserPayload {
  userId: string;
  email: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Custom /me endpoint response shape
// ---------------------------------------------------------------------------

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    type: string | null;
  };
}
