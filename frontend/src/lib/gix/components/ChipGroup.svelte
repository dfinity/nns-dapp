<script lang="ts">
  import type { ChipGroupItem } from "../types/chip-group";
  import Chip from "./Chip.svelte";

  interface Props {
    chips?: ChipGroupItem[];
    testId?: string;
    onSelect?: (selectedId: string) => void;
  }

  let {
    chips = $bindable([]),
    testId = "gix-cmp-chip-group-component",
    onSelect,
  }: Props = $props();

  const onChipClick = (selectedId: string) => {
    chips = chips.map((chip) => ({
      ...chip,
      selected: chip.id === selectedId,
    }));
    onSelect?.(selectedId);
  };
</script>

<div
  class="chip-group"
  aria-label="Options"
  data-tid={testId}
  role="radiogroup"
>
  {#each chips as { id, label, selected } (id)}
    <Chip {id} {label} onClick={onChipClick} {selected} />
  {/each}
</div>

<style lang="scss">
  .chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--padding-0_5x);
  }
</style>
