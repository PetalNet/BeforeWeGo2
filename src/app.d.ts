// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { SessionValidationResult } from "$lib/server/auth";

declare global {
  export namespace App {
    interface Locals {
      user: SessionValidationResult["user"];
      session: SessionValidationResult["session"];
    }

    // interface Error {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}
