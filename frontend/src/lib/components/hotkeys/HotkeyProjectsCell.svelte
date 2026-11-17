<script lang="ts">
  import Logo from "$lib/components/ui/Logo.svelte";
  import type { HotkeysTableRowData } from "$lib/types/hotkeys";

  type Props = {
    rowData: HotkeysTableRowData;
  };

  const { rowData }: Props = $props();
</script>

<ul data-tid="hotkey-projects-cell">
  {#each rowData.hotkey.projects as { universe, neuronCount } (universe.canisterId)}
    <li data-tid="hotkey-project">
      <Logo src={universe.logo} alt={universe.title} size="small" framed />
      <span data-tid="hotkey-project-title">{universe.title}</span>
      <span class="count" data-tid="hotkey-project-neuron-count"
        >{neuronCount}</span
      >
    </li>
  {/each}
</ul>

<style lang="scss">
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--padding);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
    padding: var(--padding-0_5x) var(--padding);
    border-radius: var(--border-radius);
    background: var(--tag-background);
  }

  .count {
    color: var(--text-description);
  }
</style>
