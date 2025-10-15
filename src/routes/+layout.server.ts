import type { User } from "$lib/server/auth.js";

export const load = ({ locals }): { user: User | undefined } => {
  return {
    user: locals.user,
  };
};
