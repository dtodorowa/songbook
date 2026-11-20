<script lang="ts">
  import { Trash2 } from "lucide-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";

  type Props = { title: string; ondelete: () => Promise<void> };
  let { title, ondelete }: Props = $props();

  let open = $state(false);
  let deleting = $state(false);

  async function confirm() {
    deleting = true;
    try {
      await ondelete();
      open = false;
    } finally {
      deleting = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" iconOnly aria-label="Delete song" title="Delete song">
        <Trash2 class="h-4.5 w-4.5" />
      </Button>
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Content class="bg-card">
    <Dialog.Header>
      <Dialog.Title>Delete {title}?</Dialog.Title>
      <Dialog.Description>
        Its lyrics, sync and playing notes go with it. This can't be undone, unless you have a
        backup.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
      <Button
        onclick={confirm}
        loading={deleting}
        class="border-red-600 bg-red-600 hover:bg-red-700"
      >
        Delete song
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
