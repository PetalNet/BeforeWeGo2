<script lang="ts" module>
  import favicon from "$lib/assets/favicon.png";

  let lastProcessedTrackId: string | undefined = $state();
  async function resolveAlbumImage(value: string): Promise<string> {
    // avoid re-processing same value
    if (value === lastProcessedTrackId) return lastProcessedTrackId;
    lastProcessedTrackId = value;

    // direct scdn url or other http(s) url — use as-is
    if (value.startsWith("https://") || value.startsWith("http://")) {
      return value;
    }

    // spotify:image:<hash>
    if (value.startsWith("spotify:image:")) {
      return `https://i.scdn.co/image/${value.replace(/^spotify:image:/, "")}`;
    }

    // If it's a 22-character Spotify id, try fetching track metadata to get album image
    if (/^[a-zA-Z0-9]{22}$/.test(value)) {
      try {
        const res = await fetch(
          `/api/spotify/track?id=${encodeURIComponent(value)}`,
        );
        const json = (await res.json()) as unknown;
        if (res.ok && typeof json === "object" && json !== null) {
          const maybeAlbum = (json as { album?: { image?: unknown } }).album;
          if (maybeAlbum && typeof maybeAlbum.image === "string") {
            return maybeAlbum.image;
          }
        }
      } catch (err) {
        // non-fatal; just don't show album art
        // keep console message for debugging
        console.error("Polaroid: failed to fetch spotify track", err);
      }
    }

    // treat as a possible scdn hash (32-64 chars)
    if (/^[a-zA-Z0-9]{32,64}$/.test(value)) {
      return `https://i.scdn.co/image/${value}`;
    }

    return favicon;
  }
</script>

<script lang="ts">
  let flipped = $state(false);

  export interface Song {
    title: string;
    artist: string;

    /** spotify track id or various image identifiers/URLs */
    spotifyTrackId: string;
  }

  export interface Props {
    /** Primary display props */
    name: string;

    /** main profile / polaroid image */
    photo: string;
    /** optional smaller memory/album art on the back */
    memoryPhoto?: string;
    favoriteSong?: Song | undefined;
    likes: number;
    cries: number;

    year: number;
    clickable?: boolean | undefined;
    href: string | undefined;
    rotation: string | undefined;
  }

  let {
    name = $bindable(),
    photo = $bindable(),
    memoryPhoto,
    favoriteSong,
    likes,
    cries,
    year,
    clickable = false,
    href,
    rotation,
  }: Props = $props();

  let normalizedAlbumImage = $derived(
    favoriteSong
      ? await resolveAlbumImage(favoriteSong.spotifyTrackId)
      : undefined,
  );

  let nameAlt = $derived(`${name}’s Profile`);
  let classYear = $derived(`Class of ${year.toFixed()}`);
</script>

<div
  class="h-[330px] w-[260px] cursor-pointer bg-transparent transition-transform duration-500 [transition-timing-function:cubic-bezier(0.2,0.9,0.3,1)] [perspective:1000px] focus-within:!-translate-y-1.5 focus-within:!scale-[1.04] focus-within:![transform:rotateZ(0deg)_translateY(-6px)_scale(1.04)] hover:!-translate-y-1.5 hover:!scale-[1.04] hover:![transform:rotateZ(0deg)_translateY(-6px)_scale(1.04)] focus:!-translate-y-1.5 focus:!scale-[1.04] focus:![transform:rotateZ(0deg)_translateY(-6px)_scale(1.04)]"
  onclick={(): void => {
    flipped = !flipped;
  }}
  onkeydown={(e: KeyboardEvent): void => {
    const k = e.key;
    if (k === "Enter" || k === " ") {
      e.preventDefault();
      flipped = !flipped;
    }
  }}
  style:transform="rotateZ({rotation || '0deg'})"
  tabindex="0"
  role="button"
  aria-pressed={flipped}
>
  <div
    class="relative h-full w-full transition-transform duration-[0.6s] [transform-style:preserve-3d] {flipped
      ? '[transform:rotateY(180deg)!important]'
      : ''}"
  >
    <!-- Front -->
    <div
      class="absolute flex h-full w-full flex-col items-center justify-start overflow-hidden rounded bg-[#f5f0e8] shadow-[0_8px_20px_rgba(0,0,0,0.25)] [backface-visibility:hidden]"
    >
      {#if clickable && href}
        <a {href} class="-mb-2.5">
          <img
            src={photo}
            alt={nameAlt}
            class="mx-2.5 my-3 mb-1.5 block h-auto w-[calc(100%-20px)] rounded object-cover"
          />
        </a>
      {:else}
        <img
          src={photo}
          alt={nameAlt}
          class="mx-2.5 my-3 mb-1.5 block h-auto w-[calc(100%-20px)] rounded object-cover"
        />
      {/if}
      <div
        class="box-border flex w-full flex-col items-center gap-0 bg-[#f5f0e8] px-2 pt-2 pb-2.5 text-center font-['Permanent_Marker',cursive] text-[1.1rem] text-black"
      >
        <p
          class="mt-2 mb-0.5 text-[1.18rem] leading-[1.02] font-bold tracking-[0.4px]"
        >
          {name}
        </p>
        <p class="m-0 text-base opacity-95">{classYear}</p>
      </div>
    </div>

    <!-- Back -->
    <div
      class="absolute box-border flex h-full w-full [transform:rotateY(180deg)] flex-col justify-start overflow-visible rounded-md bg-[#f5f0e8] p-4 text-left font-['Permanent_Marker',cursive] text-black shadow-[0_4px_12px_rgba(0,0,0,0.25)] [backface-visibility:hidden]"
    >
      <div
        class="absolute -top-3 -right-3 rounded-full bg-white px-4 py-1.5 text-[0.95rem] shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
      >
        Send a Letter
      </div>
      <div class="mt-2 mb-0 ml-0 flex items-center gap-2.5 self-start pl-1.5">
        <img
          src={photo || "/default-cover.png"}
          alt={nameAlt}
          class="h-10 w-10 rounded-full object-cover shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
        />
        <div>
          <h2 class="m-0 text-left text-base leading-[1.2]">{name}</h2>
          <p class="m-0 text-left text-[0.9rem] leading-[1.1]">{classYear}</p>
        </div>
      </div>
      <div class="mt-0">
        <h3 class="mb-1.5 text-[0.95rem] italic">My Favorite Memory</h3>
        <img
          src={memoryPhoto}
          alt="Memory"
          class="h-[110px] w-[calc(100%-4px)] rounded-md object-cover shadow-[0_3px_6px_rgba(0,0,0,0.15)]"
        />
      </div>
      {#if favoriteSong}
        <div class="-mt-1 self-start pl-4">
          <h3 class="mt-1 mb-1 text-[0.9rem] italic">My Song</h3>
          <div class="flex items-center gap-2">
            <img
              src={`/api/image-proxy?url=${encodeURIComponent(normalizedAlbumImage!)}`}
              alt="Album art"
              class="h-10 w-10 rounded-md object-cover shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
            />
            <div class="flex flex-col justify-center leading-[1.1]">
              <strong class="text-base">{favoriteSong.title}</strong>
              <small class="text-[0.8rem]">{favoriteSong.title}</small>
            </div>
          </div>
        </div>
      {/if}
      <div
        class="absolute -right-3 -bottom-3 flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[0.95rem] shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
      >
        ❤️ {likes} 😭 {cries}
      </div>
    </div>
  </div>
</div>
