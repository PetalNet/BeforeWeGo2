<script lang="ts">
  import { page } from "$app/state";
</script>

<h1 class="text-5xl">{page.status}</h1>
<p>{JSON.stringify(page.error)}</p>
