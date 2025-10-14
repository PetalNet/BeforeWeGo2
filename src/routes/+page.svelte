<script lang="ts">
  import { resolve } from "$app/paths";
  import Polaroid, { type Song } from "../components/Polaroid.svelte";
  import { getCohort } from "./cohort.remote.ts";

  const { users, user, cohortInfo } = await getCohort();

  // Rotations for the polaroids
  const rotations = [
    "3deg",
    "-2deg",
    "2.5deg",
    "-3deg",
    "1.5deg",
    "-1deg",
    "0.5deg",
  ];

  // Function to get a rotation for each user
  function getRotation(index: number): string | undefined {
    return rotations[index % rotations.length];
  }
</script>

<main>
  <header class="mb-8 p-4 text-center">
    <h1 class="mb-2 text-4xl text-gray-800">
      Before We Go – Class of {cohortInfo.year}
    </h1>
    <p class="m-0 text-lg text-gray-600">
      {cohortInfo.count} student{cohortInfo.count > 1 ? "s" : ""} from {cohortInfo.domain}
    </p>
  </header>

  <section>
    {#if users.length > 0}
      {#each users as classmate, index (classmate.id)}
        <Polaroid
          rotation={getRotation(index)}
          name={classmate.name}
          photo={classmate.profilePicture}
          year={classmate.graduationYear}
          clickable={true}
          href={resolve(`/profile/[user]`, {
            user: classmate.id,
          })}
          memoryPhoto={classmate.favoriteMemoryPhoto}
          favoriteSong={classmate.favoriteSong &&
          classmate.favoriteArtist &&
          classmate.spotifyTrackId
            ? ({
                title: classmate.favoriteSong,
                artist: classmate.favoriteArtist,
                spotifyTrackId: classmate.spotifyTrackId,
              } satisfies Song)
            : undefined}
          cries={0}
          likes={0}
        />
      {/each}
    {:else if user}
      <!-- Show message if no cohort members found -->
      <div class="mx-auto max-w-lg p-12 text-center">
        <h2 class="mb-4 text-3xl text-gray-800">No classmates found yet</h2>
        <p class="text-lg leading-relaxed text-gray-600">
          Be the first to complete your profile, or wait for your classmates to
          join!
        </p>
      </div>
    {:else}
      <!-- Show login prompt if not logged in -->
      <div class="mx-auto max-w-lg p-12 text-center">
        <h2 class="mb-4 text-3xl text-gray-800">Welcome to Before We Go</h2>
        <p class="text-lg leading-relaxed text-gray-600">
          Please <a
            href={resolve("/login")}
            class="font-medium text-blue-600 no-underline hover:underline"
            >log in</a
          > to see your classmates.
        </p>
      </div>
    {/if}
  </section>
</main>
