<script lang="ts">
  import { resolve } from "$app/paths";
  import { loginSchema } from "$lib/schemas/login.js";
  import { login } from "./login.remote.js";

  const { _password, email } = login.fields;
</script>

<main class="p-4">
  <h1 class="py-6 text-5xl">Sign In</h1>
  <p class="py-4 text-2xl">
    Use your personal email and password after both emails have been verified.
  </p>

  <form
    {...login.preflight(loginSchema)}
    class="grid max-w-96 grid-cols-[auto_1fr] gap-4"
  >
    <label class="col-span-2 grid grid-cols-subgrid items-center gap-4">
      <span>Email</span>
      <input
        {...email.as("email")}
        class="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </label>
    {#if email.issues()}
      <ul class="col-start-2 text-sm text-red-600">
        {#each email.issues() as issue (issue.message)}
          <li>{issue.message}</li>
        {/each}
      </ul>
    {/if}

    <label class="col-span-2 grid grid-cols-subgrid items-center gap-4">
      <span>Password</span>
      <input
        {..._password.as("password")}
        class="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </label>

    {#if _password.issues()}
      <ul class="col-start-2 text-sm text-red-600">
        {#each _password.issues() as issue (issue.message)}
          <li>{issue.message}</li>
        {/each}
      </ul>
    {/if}

    <div class="col-span-2 flex items-center gap-4">
      <button
        class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >Login</button
      >
      <a
        class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-white transition hover:bg-blue-700"
        href={resolve("/register/")}>Register Here</a
      >
    </div>
  </form>
</main>
