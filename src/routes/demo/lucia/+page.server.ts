import { redirect } from "@sveltejs/kit";
import { getRequestEvent } from "$app/server";

export const load = () => {
  const user = requireLogin();
  return { user };
};

function requireLogin() {
  const { locals } = getRequestEvent();

  if (!locals.user) {
    return redirect(302, "/demo/lucia/login");
  }

  return locals.user;
}
