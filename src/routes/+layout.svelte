<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.png";
  import { resolve } from "$app/paths";

  let { data, children } = $props();
  let id = $props.id();

  let user = $derived(data?.user);
  let isAdmin = $derived(user?.role === "ADMIN");
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<header
  class="flex items-center justify-between bg-gray-50 px-4 py-6 shadow-md sm:px-8"
>
  <div>
    <a
      href={resolve("/")}
      class="m-0 font-handwriting text-3xl text-gray-900 no-underline transition-colors select-none hover:text-gray-700 sm:text-5xl"
    >
      Before We Go...
    </a>
  </div>

  <div class="flex items-center gap-8">
    <nav class="flex items-center gap-4">
      {#if user}
        {#if isAdmin}
          <a
            href={resolve("/admin")}
            class="mx-2 font-sans text-base text-gray-900 no-underline transition-colors select-none hover:text-gray-600 sm:text-xl"
          >
            Admin
          </a>
        {/if}
      {:else}
        <a
          href={resolve("/register")}
          class="mx-2 font-sans text-base text-gray-900 no-underline transition-colors select-none hover:text-gray-600 sm:text-xl"
        >
          Register
        </a>
        <a
          href={resolve("/login")}
          class="mx-2 font-sans text-base text-gray-900 no-underline transition-colors select-none hover:text-gray-600 sm:text-xl"
        >
          Sign in
        </a>
      {/if}
    </nav>

    {#if user}
      <div class=" relative">
        <!-- Hidden checkbox for CSS-only toggle -->
        <input
          type="checkbox"
          id={`${id}-profile-menu-toggle`}
          aria-label="Toggle user menu"
        />

        <!-- Profile button (label) -->
        <label
          for={`${id}-profile-menu-toggle`}
          class="m-0 inline-flex cursor-pointer items-center"
          title="Open user menu"
        >
          <img
            src={user.profilePicture}
            alt={user.name}
            class="h-8 w-8 rounded-full object-cover shadow-sm ring-3 ring-amber-200 select-none sm:h-10 sm:w-10"
          />
        </label>

        <!-- Dropdown menu - shown when checkbox is checked -->
        <div
          class="invisible absolute top-[calc(100%+8px)] right-0 z-50 min-w-[200px] origin-top scale-95 rounded-lg bg-white p-4 opacity-0 shadow-lg transition-all duration-150 peer-checked:visible peer-checked:scale-100 peer-checked:opacity-100"
          role="menu"
          aria-label="User menu"
        >
          <div class="mb-2 flex items-center gap-2">
            <img
              src={user.profilePicture}
              alt="Avatar"
              class="h-11 w-11 rounded-full object-cover shadow-sm"
            />
            <div>
              <div class="font-bold text-gray-900">{user.name}</div>
              {#if isAdmin}
                <div
                  class="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 uppercase"
                >
                  Admin
                </div>
              {/if}
            </div>
          </div>

          <nav class="flex flex-col gap-2">
            <a
              href={resolve("/profile/edit")}
              class="rounded-md px-2 py-1.5 font-sans text-gray-900 no-underline transition-colors hover:bg-gray-50"
              role="menuitem"
            >
              Profile
            </a>
            <a
              href={resolve("/profile/settings")}
              class="rounded-md px-2 py-1.5 font-sans text-gray-900 no-underline transition-colors hover:bg-gray-50"
              role="menuitem"
            >
              Settings
            </a>
            <form method="POST" action="/logout">
              <button
                type="submit"
                class="w-full cursor-pointer rounded-md border-none bg-transparent px-2 py-1.5 text-left font-sans text-gray-900 transition-colors hover:bg-gray-50"
                role="menuitem"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </div>
    {/if}
  </div>
</header>

{@render children()}
