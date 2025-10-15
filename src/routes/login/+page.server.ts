import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";

export const load = (event): void => {
  if (event.locals.user) {
    redirect(302, resolve("/"));
  }
};
