<script lang="ts">
  import { resolve } from "$app/paths";
  import { getGradYear } from "$lib/grad-year.js";
  import { fullRegistrationSchema } from "$lib/schemas/register.js";
  import { register } from "./form.remote.js";
  import { onMount } from "svelte";

  const {
    name,
    graduationYear,
    schoolEmail,
    personalEmail,
    _password,
    _confirmPassword,
  } = register.fields;

  // Session storage key
  const STORAGE_KEY = "registration_progress";

  // Step management
  let currentStep = $state(1);
  const totalSteps = 4;

  // Load saved step from session storage on mount
  onMount(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        currentStep = data.step || 1;
      } catch (e) {
        console.error("Failed to load registration progress", e);
      }
    }
  });

  // Save current step to session storage
  function saveStep(): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step: currentStep }));
  }

  // Clear session storage
  function clearProgress(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    currentStep = 1;
    window.location.reload();
  }

  // Step navigation
  function nextStep(): void {
    if (currentStep < totalSteps) {
      currentStep++;
      saveStep();
    }
  }

  function prevStep(): void {
    if (currentStep > 1) {
      currentStep--;
      saveStep();
    }
  }

  // Validate current step before advancing
  function validateAndNext(event: Event): void {
    event.preventDefault();

    // Basic client-side validation before advancing
    // The actual validation happens via the remote form
    if (currentStep < totalSteps) {
      nextStep();
    }
  }
</script>

<main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
  <div class="mx-auto max-w-2xl py-8">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="mb-2 text-5xl font-bold text-gray-900">Create Account</h1>
      <p class="text-lg text-gray-600">
        Join your classmates and preserve your memories
      </p>
    </div>

    <!-- Progress Bar -->
    <div class="mb-8 rounded-xl bg-white p-6 shadow-lg">
      <div class="mb-4 flex justify-between text-sm font-medium text-gray-600">
        <span>Step {currentStep} of {totalSteps}</span>
        <span
          >{Math.round(((currentStep - 1) / totalSteps) * 100)}% Complete</span
        >
      </div>
      <div class="h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
          style="width: {((currentStep - 1) / totalSteps) * 100}%"
        ></div>
      </div>
      <div class="mt-4 grid grid-cols-4 gap-2">
        {#each Array(totalSteps) as _, i (i)}
          <div
            class="flex flex-col items-center gap-1 text-xs"
            class:opacity-50={i + 1 > currentStep}
          >
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full font-bold transition-all"
              class:bg-blue-600={i + 1 <= currentStep}
              class:text-white={i + 1 <= currentStep}
              class:bg-gray-300={i + 1 > currentStep}
              class:text-gray-600={i + 1 > currentStep}
            >
              {i + 1}
            </div>
            <span class="text-center font-medium">
              {#if i === 0}Basic Info
              {:else if i === 1}School Email
              {:else if i === 2}Personal Email
              {:else}Password{/if}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Form Card -->
    <div class="rounded-xl bg-white p-8 shadow-lg">
      <form
        {...register.preflight(fullRegistrationSchema)}
        class="space-y-6"
        onsubmit={currentStep < 4 ? validateAndNext : undefined}
      >
        <!-- Step 1: Basic Info -->
        {#if currentStep === 1}
          <div class="space-y-6">
            <h2 class="mb-4 text-2xl font-bold text-gray-900">
              Let's start with the basics
            </h2>

            <label class="block">
              <span class="mb-2 block font-semibold text-gray-700"
                >Full Name</span
              >
              <input
                {...name.as("text")}
                placeholder="Enter your full name"
                class="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              {#if name.issues()}
                <ul class="mt-2 text-sm text-red-600">
                  {#each name.issues() as issue (issue.message)}
                    <li>{issue.message}</li>
                  {/each}
                </ul>
              {/if}
            </label>

            <label class="block">
              <span class="mb-2 block font-semibold text-gray-700"
                >Graduation Year</span
              >
              <input
                {...graduationYear.as("number")}
                placeholder="e.g., {getGradYear(new Date())}"
                class="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              {#if graduationYear.issues()}
                <ul class="mt-2 text-sm text-red-600">
                  {#each graduationYear.issues() as issue (issue.message)}
                    <li>{issue.message}</li>
                  {/each}
                </ul>
              {/if}
            </label>
          </div>
        {/if}

        <!-- Step 2: School Email -->
        {#if currentStep === 2}
          <div class="space-y-6">
            <h2 class="mb-4 text-2xl font-bold text-gray-900">
              Your school email
            </h2>
            <p class="text-gray-600">
              This will be used to verify your graduation year and connect you
              with classmates.
            </p>

            <label class="block">
              <span class="mb-2 block font-semibold text-gray-700"
                >School Email Address</span
              >
              <input
                {...schoolEmail.as("email")}
                placeholder="your.name@school.edu"
                class="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              {#if schoolEmail.issues()}
                <ul class="mt-2 text-sm text-red-600">
                  {#each schoolEmail.issues() as issue (issue.message)}
                    <li>{issue.message}</li>
                  {/each}
                </ul>
              {/if}
            </label>
          </div>
        {/if}

        <!-- Step 3: Personal Email -->
        {#if currentStep === 3}
          <div class="space-y-6">
            <h2 class="mb-4 text-2xl font-bold text-gray-900">
              Your personal email
            </h2>
            <p class="text-gray-600">
              We'll use this to keep in touch with you after graduation.
            </p>

            <label class="block">
              <span class="mb-2 block font-semibold text-gray-700"
                >Personal Email Address</span
              >
              <input
                {...personalEmail.as("email")}
                placeholder="your.name@email.com"
                class="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              {#if personalEmail.issues()}
                <ul class="mt-2 text-sm text-red-600">
                  {#each personalEmail.issues() as issue (issue.message)}
                    <li>{issue.message}</li>
                  {/each}
                </ul>
              {/if}
            </label>
          </div>
        {/if}

        <!-- Step 4: Password -->
        {#if currentStep === 4}
          <div class="space-y-6">
            <h2 class="mb-4 text-2xl font-bold text-gray-900">
              Secure your account
            </h2>
            <p class="text-gray-600">
              Create a strong password to protect your account.
            </p>

            <label class="block">
              <span class="mb-2 block font-semibold text-gray-700"
                >Password</span
              >
              <input
                {..._password.as("password")}
                placeholder="Enter your password"
                class="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              {#if _password.issues()}
                <ul class="mt-2 text-sm text-red-600">
                  {#each _password.issues() as issue (issue.message)}
                    <li>{issue.message}</li>
                  {/each}
                </ul>
              {/if}
            </label>

            <label class="block">
              <span class="mb-2 block font-semibold text-gray-700"
                >Confirm Password</span
              >
              <input
                {..._confirmPassword.as("password")}
                placeholder="Confirm your password"
                class="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              {#if _confirmPassword.issues()}
                <ul class="mt-2 text-sm text-red-600">
                  {#each _confirmPassword.issues() as issue (issue.message)}
                    <li>{issue.message}</li>
                  {/each}
                </ul>
              {/if}
            </label>
          </div>
        {/if}

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between gap-4 pt-6">
          {#if currentStep > 1}
            <button
              type="button"
              onclick={prevStep}
              class="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              ← Back
            </button>
          {:else}
            <div></div>
          {/if}

          {#if currentStep < totalSteps}
            <button
              type="submit"
              class="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
            >
              Continue →
            </button>
          {:else}
            <button
              type="submit"
              class="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 font-semibold text-white shadow-md transition hover:from-green-700 hover:to-emerald-700 hover:shadow-lg"
            >
              Create Account ✓
            </button>
          {/if}
        </div>
      </form>

      <!-- Already have account -->
      <div class="mt-8 border-t border-gray-200 pt-6 text-center">
        <p class="text-gray-600">
          Already have an account?
          <a
            href={resolve("/login/")}
            class="font-semibold text-blue-600 hover:text-blue-700"
            >Sign in here</a
          >
        </p>
      </div>
    </div>

    <!-- Clear Progress Button -->
    <div class="mt-6 text-center">
      <button
        type="button"
        onclick={clearProgress}
        class="text-sm text-gray-500 underline hover:text-gray-700"
      >
        Clear saved progress
      </button>
    </div>
  </div>
</main>

<style>
  /* Smooth transitions for all interactive elements */
  button,
  input,
  a {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
  }

  /* Focus states for accessibility */
  button:focus-visible,
  input:focus-visible,
  a:focus-visible {
    outline: 2px solid rgb(59, 130, 246);
    outline-offset: 2px;
  }
</style>
