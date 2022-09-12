<script lang="ts">
  import en from "../../../tests/mocks/i18n.mock";
  import IconEast from "../../icons/IconEast.svelte";
  import IconWest from "../../icons/IconWest.svelte";
</script>

<div role="toolbar">
  <button class="ghost">
    <IconWest />
    {en.core.previous}</button
  >

  <button class="ghost">
    {en.core.next}
    <IconEast />
  </button>
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: space-between;

    margin-bottom: var(--padding-3x);
  }

  button {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
  }
</style>
