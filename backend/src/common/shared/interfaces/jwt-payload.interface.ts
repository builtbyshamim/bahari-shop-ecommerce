// interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string; // user ID
  email: string | null; // user email
  role?: string ;
  name?: string;
  phone?: string | null;
  iat?: number; // issued at
  exp?: number; // expiration
}
