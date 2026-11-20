<script lang="ts">
  import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
  import { Dialog as DialogPrimitive } from "bits-ui";
  import XIcon from "lucide-svelte/icons/x";
  import type { Snippet } from "svelte";
  import DialogOverlay from "./dialog-overlay.svelte";

  let {
    ref = $bindable(null),
    class: className,
    overlayClass,
    portalProps,
    showCloseButton = true,
    children,
    ...restProps
  }: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
    portalProps?: DialogPrimitive.PortalProps;
    overlayClass?: string;
    showCloseButton?: boolean;
    children: Snippet;
  } = $props();
</script>

<DialogPrimitive.Portal {...portalProps}>
  <DialogOverlay class={overlayClass} />
  <DialogPrimitive.Content
    bind:ref
    data-slot="dialog-content"
    class={cn(
      "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border p-6 shadow-lg duration-200",
      className
    )}
    {...restProps}
  >
    {@render children?.()}
    {#if showCloseButton}
      <DialogPrimitive.Close
        class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-lg opacity-70 transition-opacity hover:opacity-100 active:opacity-50 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
      >
        <XIcon class="size-4" />
        <span class="sr-only">Close</span>
      </DialogPrimitive.Close>
    {/if}
  </DialogPrimitive.Content>
</DialogPrimitive.Portal>
