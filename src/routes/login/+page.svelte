<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";

  let { form } = $props();
</script>

<main>
  <h1 class="py-6 text-5xl">Sign In</h1>
  <p class="py-4 text-2xl">
    Use your personal email and password after both emails have been verified.
  </p>
  <form
    class="grid max-w-96 grid-cols-[auto_1fr] gap-4"
    method="post"
    action="?/login"
    use:enhance
  >
    <label class="col-span-2 grid grid-cols-subgrid items-center gap-4">
      <span>Email</span>
      <input
        name="email"
        class="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </label>
    <label class="col-span-2 grid grid-cols-subgrid items-center gap-4">
      <span>Password</span>
      <input
        type="password"
        name="password"
        class="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </label>
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
  <p style="color: red">{form?.message ?? ""}</p>
</main>
