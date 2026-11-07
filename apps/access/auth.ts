/** Integrate an authenticated server here. Credentials never enter Hypergraph or Inspector. */
export interface AuthService {
  signIn(credentials: {email: string; password: string}, signal: AbortSignal): Promise<void>;
  recover(email: string, signal: AbortSignal): Promise<void>;
}
export class AuthError extends Error {
  constructor(readonly code: 'unavailable' | 'rejected' | 'offline') { super(code); }
}
// No invented endpoint, simulated session, or outgoing credential request.
export const unavailableAuth: AuthService = {
  async signIn() { throw new AuthError('unavailable'); },
  async recover() { throw new AuthError('unavailable'); },
};
