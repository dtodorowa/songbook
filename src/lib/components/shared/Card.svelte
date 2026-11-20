<script lang="ts" module>
  import { tv, type VariantProps } from "tailwind-variants";
  import { CARD_HOVER } from "$lib/utils/card-hover";

  // The surface shell that's copy-pasted across the app: a rounded-2xl card with
  // the standard border + bg. `interactive` adds the app-wide card hover (CARD_HOVER)
  // on top of a resting drop shadow. Everything page-specific (padding, layout, extra
  // hovers) comes in via `class`.
  const SHELL = "rounded-2xl border border-border bg-card";

  export const cardVariants = tv({
    // The shell lives in the variants rather than the base so `bare` is the absence
    // of one, not three utilities racing tailwind-merge to cancel it. Callers used
    // to write `bg-transparent border-none` by hand and keep the radius by accident.
    base: "",
    variants: {
      variant: {
        flat: SHELL,
        interactive: `${SHELL} shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-18px_rgba(0,0,0,0.16)] ${CARD_HOVER}`,
        // No shell at all: the content sits straight on the page surface. For panels
        // that only ever wrapped a chart, on a page that gives them a surface of its
        // own (see showsWhiteColumn in builder-routes.ts).
        bare: "",
      },
    },
    defaultVariants: {
      variant: "flat",
    },
  });

  export type CardVariant = NonNullable<VariantProps<typeof cardVariants>["variant"]>;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

  type Props = {
    variant?: CardVariant;
    /** Render as an <a> when set; otherwise a <div>. */
    href?: string;
    class?: string;
    children: Snippet;
  } & Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> &
    Omit<HTMLAnchorAttributes, "class" | "children">;

  let { variant = "flat", href, class: klass = "", children, ...rest }: Props = $props();

  let cls = $derived(cardVariants({ variant, class: klass }));
</script>

{#if href}
  <a {href} class={cls} {...rest as HTMLAnchorAttributes}>
    {@render children()}
  </a>
{:else}
  <div class={cls} {...rest as HTMLAttributes<HTMLDivElement>}>
    {@render children()}
  </div>
{/if}
