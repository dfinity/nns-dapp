<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { soonLosingRewardNeuronsStore } from "$lib/derived/neurons.derived";
  import { i18n } from "$lib/stores/i18n";
</script>

<TestIdWrapper testId="nns-neurons-missing-rewards-badge-component">
  {#if $soonLosingRewardNeuronsStore.length > 0}
    <span
      data-tid="badge"
      class="badge"
      role="status"
      aria-label={$i18n.missing_rewards.badge_label}
    ></span>
  {/if}
</TestIdWrapper>

<style lang="scss">
  .badge {
    display: flex;
    justify-content: center;
    align-items: center;

    &::after {
      content: "";
      display: block;
      padding: var(--padding-0_5x);
      border-radius: 50%;
      background-color: var(--negative-emphasis);
    }
  }
</style>
