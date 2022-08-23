<script lang="ts">
  import IconInfoOutline from "../../icons/IconInfoOutline.svelte";
  import Collapsible from "./Collapsible.svelte";
  import KeyValuePair from "./KeyValuePair.svelte";

  export let testId: string | undefined = undefined;

  let toggleContent: () => void;
</script>

<Collapsible expandButton={false} externalToggle={true} bind:toggleContent>
  <KeyValuePair {testId} slot="header">
    <div class="wrapper" slot="key">
      <slot name="key" />
      <button class="icon" on:click|stopPropagation={toggleContent}>
        <IconInfoOutline />
      </button>
    </div>

    <svelte:fragment slot="value"><slot name="value" /></svelte:fragment>
  </KeyValuePair>

  <slot name="info" />
</Collapsible>

<style lang="scss">
  .wrapper {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .icon {
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
</style>
