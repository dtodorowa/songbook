<script lang="ts" module>
  import { tv, type VariantProps } from "tailwind-variants";

  export const buttonVariants = tv({
    base: "group/btn inline-flex items-center justify-center gap-2 font-medium font-sans no-underline cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:cursor-default disabled:active:scale-100 border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple/60",
    variants: {
      variant: {
        // solid ink, softened on hover (highest emphasis)
        primary: "bg-ink text-surface border-ink hover:bg-ink/85 hover:border-ink/85",
        // purple-tinted, low emphasis
        soft: "bg-accent-purple/15 dark:bg-accent-purple/25 text-accent-purple border-transparent hover:bg-accent-purple/25 dark:hover:bg-accent-purple/35",
        // bordered, transparent bg
        outline: "bg-transparent text-ink border-ink/10 hover:bg-ink/5 hover:border-ink/20",
        // no border, hover bg tint (lowest emphasis)
        ghost: "bg-transparent text-ink-muted border-transparent hover:bg-ink/5 hover:text-ink",
        // card chip — surface w/ subtle border
        subtle:
          "bg-card text-ink border-ink/10 hover:border-ink/20 hover:shadow-[0_10px_30px_hsl(var(--ink)/0.08)]",
        // alias for back-compat with existing callsites
        secondary: "bg-transparent text-ink border-ink/10 hover:bg-ink/5 hover:border-ink/20",
      },
      size: {
        xs: "text-xs",
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base font-semibold",
      },
      shape: {
        pill: "rounded-full",
        soft: "rounded-2xl",
        rounded: "rounded-lg",
        square: "rounded-lg",
      },
      iconOnly: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // icon-only buttons stay circular tokens regardless of shape
      { iconOnly: true, class: "rounded-full" },
      // padded sizes (text + icon)
      { iconOnly: false, size: "xs", class: "px-2.5 py-1" },
      { iconOnly: false, size: "sm", class: "px-3 py-1.5" },
      { iconOnly: false, size: "md", class: "px-5 py-2.5" },
      { iconOnly: false, size: "lg", class: "px-6 py-3" },
      // icon-only square dimensions
      { iconOnly: true, size: "xs", class: "w-7 h-7 p-0" },
      { iconOnly: true, size: "sm", class: "w-8 h-8 p-0" },
      { iconOnly: true, size: "md", class: "w-10 h-10 p-0" },
      { iconOnly: true, size: "lg", class: "w-12 h-12 p-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "rounded",
      iconOnly: false,
    },
  });

  export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
  export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;
  export type ButtonShape = NonNullable<VariantProps<typeof buttonVariants>["shape"]>;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
  import { Loader2 } from "lucide-svelte";

  type Props = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    shape?: ButtonShape;
    iconOnly?: boolean;
    loading?: boolean;
    href?: string;
    class?: string;
    ref?: HTMLButtonElement | HTMLAnchorElement | null;
    children: Snippet;
  } & Omit<HTMLButtonAttributes, "class" | "children"> &
    Omit<HTMLAnchorAttributes, "class" | "children">;

  let {
    variant = "primary",
    size = "md",
    shape = "rounded",
    iconOnly = false,
    loading = false,
    href,
    class: klass = "",
    ref = $bindable(null),
    children,
    disabled,
    ...rest
  }: Props = $props();

  let cls = $derived(buttonVariants({ variant, size, shape, iconOnly, class: klass }));
</script>

{#if href && !disabled}
  <a bind:this={ref} {href} class={cls} {...rest as HTMLAnchorAttributes}>
    {#if loading}
      <Loader2 class="w-4 h-4 animate-spin" />
    {:else}
      {@render children()}
    {/if}
  </a>
{:else}
  <button
    bind:this={ref}
    class={cls}
    disabled={disabled || loading}
    {...rest as HTMLButtonAttributes}
  >
    {#if loading}
      <Loader2 class="w-4 h-4 animate-spin" />
    {:else}
      {@render children()}
    {/if}
  </button>
{/if}
