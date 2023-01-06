<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { nowInSeconds, secondsToDuration } from "$lib/utils/date.utils";
  import { i18n } from "$lib/stores/i18n";
  import { AUTH_SESSION_DURATION } from "$lib/constants/identity.constants";

  export let deadlineTimestampSeconds: bigint | undefined;

  const ZERO = BigInt(0);

  let clear: NodeJS.Timeout | undefined;
  let countdown: bigint | undefined = undefined;

  const clearCountdown = () => {
    if (clear !== undefined) {
      clearInterval(clear);
    }
  };

  const next = () => {
    if (
      deadlineTimestampSeconds === undefined ||
      deadlineTimestampSeconds < ZERO
    ) {
      clearCountdown();
      return;
    }

    if (countdown !== undefined && countdown < ZERO) {
      clearCountdown();
      return;
    }

    countdown = deadlineTimestampSeconds - BigInt(nowInSeconds());

    // No need to schedule an update if the countdown is longer than an hour plus the auth session duration because even if we refresh,
    // the display value would remain the same until the end of the session
    if (
      countdown >
      AUTH_SESSION_DURATION / BigInt(1_000_000_000) + BigInt(3600)
    ) {
      clearCountdown();
      return;
    }

    // No need to re-schedule an update if we already know the countdown is over
    if (countdown < ZERO) {
      return;
    }

    nextTimeout();
  };

  /**
   * Refresh every minute if more than an hour otherwise every second.
   */
  const nextTimeout = () => {
    const frequency: "minutes" | "seconds" =
      (countdown ?? ZERO) > BigInt(3600) ? "minutes" : "seconds";
    clear = setTimeout(
      next,
      frequency === "minutes" ? 60000 : 1000
    ) as NodeJS.Timeout;
  };

  onMount(next);

  onDestroy(clearCountdown);
</script>

{#if countdown !== undefined && countdown > ZERO}
  <p class="description">
    {secondsToDuration(countdown)}
    {$i18n.proposal_detail.remaining}
  </p>
{/if}

<style lang="scss">
  p {
    text-align: right;
    margin-bottom: 0;
  }
</style>
