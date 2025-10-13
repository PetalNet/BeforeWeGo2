<script lang="ts">
  import { resolve } from "$app/paths";

  type CohortInfo = { year: string; count: number; domain: string };
  type Classmate = {
    id: string;
    profilePicture?: string | null;
    name?: string | null;
    graduationYear?: string | number | null;
    favoriteMemoryPhoto?: string | null;
    favoriteSong?: string | null;
    favoriteArtist?: string | null;
    spotifyTrackId?: string | null;
  };

  type PageData = {
    users?: Classmate[];
    user?: Record<string, unknown> | null;
    cohortInfo?: CohortInfo;
  };

  interface Props {
    data?: PageData;
  }

  let { data = {} }: Props = $props();

  // Provide safe defaults for template rendering
  const {
    users = [] as Classmate[],
    user = null,
    cohortInfo = { year: "", count: 0, domain: "" } as CohortInfo,
  } = data;

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
  const getRotation = (index: number) => rotations[index % rotations.length];
</script>

<main class="theme-container">
  {#if user && cohortInfo}
    <header class="mb-8 p-4 text-center">
      <h1 class="mb-2 text-4xl text-gray-800">
        Before We Go – Class of {cohortInfo.year}
      </h1>
      <p class="m-0 text-lg text-gray-600">
        {cohortInfo.count}
        {cohortInfo.count === 1 ? "student" : "students"} from {cohortInfo.domain}
      </p>
    </header>
  {/if}

  <section class="theme-gallery">
    {#if users.length > 0}
      {#each users as classmate, index (classmate.id)}
        <!-- You can wire spotifyTrackId/albumImage here if those fields exist on the user object -->
        <!-- <Polaroid
          rotation={getRotation(index)}
          photo={classmate.profilePicture ?? "/default-cover.png"}
          alt={(classmate.name ?? "") + "'s profile"}
          caption={classmate.name ?? ""}
          year={classmate.graduationYear ?? ""}
          clickable={true}
          href={resolve(`/profile/[user]`, {
            user: classmate.id,
          })}
          memoryPhoto={classmate.favoriteMemoryPhoto ?? undefined}
          songTitle={classmate.favoriteSong ?? undefined}
          songArtist={classmate.favoriteArtist ?? undefined}
          spotifyTrackId={classmate.spotifyTrackId ?? undefined}
        /> -->
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
