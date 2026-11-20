<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { Download, Upload } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import Card from "$lib/components/shared/Card.svelte";
  import PageColumn from "$lib/components/shared/PageColumn.svelte";
  import PageHeader from "$lib/components/shared/PageHeader.svelte";
  import { importSongs, SONGS_DEPENDENCY } from "$lib/db/songs";
  import { backupFileName, buildBackup, parseBackup } from "$lib/utils/backup";
  import type { PageData } from "./$types";

  type Props = { data: PageData };
  let { data }: Props = $props();

  let fileInput = $state<HTMLInputElement | null>(null);
  let message = $state("");
  let error = $state("");

  function download() {
    const now = new Date();
    const json = JSON.stringify(buildBackup(data.songs, now.getTime()), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = backupFileName(now);
    link.click();
    URL.revokeObjectURL(url);
  }

  async function restore(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    message = "";
    error = "";
    const parsed = parseBackup(await file.text());
    if (!parsed.ok) {
      error = parsed.error;
      return;
    }
    await importSongs(parsed.songs);
    await invalidate(SONGS_DEPENDENCY);
    message = `Restored ${parsed.songs.length} ${parsed.songs.length === 1 ? "song" : "songs"}.`;
  }
</script>

<svelte:head><title>Backup · songbook</title></svelte:head>

<PageColumn>
  <PageHeader
    title="Backup"
    description="Your songs live in this browser only. Save a backup file now and then, and use it to move them to another browser or computer."
  />

  <div class="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
    <Card class="flex flex-col gap-3 p-5">
      <h2 class="m-0 font-serif text-xl text-ink">Save a backup</h2>
      <p class="m-0 flex-1 text-base text-ink-muted">
        Every song, with its lyrics, sync and playing notes, in one file.
      </p>
      <div>
        <Button onclick={download} disabled={!data.songs.length}>
          <Download class="h-4 w-4" />
          Download {data.songs.length}
          {data.songs.length === 1 ? "song" : "songs"}
        </Button>
      </div>
    </Card>

    <Card class="flex flex-col gap-3 p-5">
      <h2 class="m-0 font-serif text-xl text-ink">Restore</h2>
      <p class="m-0 flex-1 text-base text-ink-muted">
        Adds the songs from a backup file. A song already here is replaced by its copy in the file.
      </p>
      <div>
        <Button variant="outline" onclick={() => fileInput?.click()}>
          <Upload class="h-4 w-4" />
          Choose a backup file
        </Button>
        <input
          bind:this={fileInput}
          type="file"
          accept="application/json,.json"
          onchange={restore}
          class="hidden"
        />
      </div>
      {#if message}<p class="m-0 text-sm text-ink" role="status">{message}</p>{/if}
      {#if error}<p class="m-0 text-sm text-red-500" role="alert">{error}</p>{/if}
    </Card>
  </div>
</PageColumn>
