<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { formatCyclesToTCycles } from "../../utils/canisters.utils";
  import Card from "../ui/Card.svelte";

  export let cycles: bigint;
  // TODO: UI - https://dfinity.atlassian.net/browse/L2-599
</script>

<Card testId="canister-cycles-card">
  <p aria-label={$i18n.canister_detail.cycles}>
    <span class="cycles">{formatCyclesToTCycles(cycles)}</span>
    <span>{$i18n.canister_detail.t_cycles}</span>
  </p>
</Card>

<style lang="scss">
  p {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: var(--padding);
  }

  .cycles {
    font-weight: 700;
    font-size: var(--font-size-h3);
  }
</style>
