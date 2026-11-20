import { DatabaseBackup, Library, Mic, Plus } from "lucide-svelte";
import type { Component } from "svelte";

/** `shortLabel` is what fits under an icon in the phone tab bar. */
export type NavLink = { href: string; label: string; shortLabel: string; icon: Component };

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Songs", shortLabel: "Songs", icon: Library as unknown as Component },
  { href: "/songs/new", label: "Add song", shortLabel: "Add", icon: Plus as unknown as Component },
  { href: "/sing", label: "Sing along", shortLabel: "Sing", icon: Mic as unknown as Component },
  {
    href: "/backup",
    label: "Backup",
    shortLabel: "Backup",
    icon: DatabaseBackup as unknown as Component,
  },
];
