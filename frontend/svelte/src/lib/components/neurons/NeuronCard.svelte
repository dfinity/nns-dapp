<script lang="ts">
  import IconLockClock from "../../icons/IconLockClock.svelte";
  import Card from "../Card.svelte";

  const goToDetail = () => {
    // TODO L2-218: Go to the detail page of Neuron
  };
</script>

<!-- TODO L2-218 -->
<Card role="link" on:click={goToDetail} ariaLabel="go to neuron details">
  <div slot="start" class="lock">
    <!-- TODO data from props: L2-218 -->
    <h4>14225061177570733325</h4>
    <h5 class="white">
      Locked
      <IconLockClock />
    </h5>
  </div>

  <div slot="end" class="currency">
    <!-- TODO use ICP component and data from props: L2-218 -->
    <h3>2.00</h3>
    <span>ICP</span>
    <h5>Stake</h5>
  </div>

  <!-- TODO helper and data from props: L2-218 -->
  <p class="duration">3 Years, 64 Days Dissolve Delay</p>
</Card>

<style lang="scss">
  h4,
  h3 {
    line-height: var(--line-height-standard);
  }

  h3 {
    margin-bottom: 0;
  }

  .lock {
    margin-bottom: 0;
    h5 {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
  }

  .white {
    color: var(--background-contrast);
  }

  .currency {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    // TODO to be removed by: L2-218
    & span {
      font-size: var(--font-size-ultra-small);
    }
  }

  .duration {
    font-size: var(--font-size-h5);
  }
</style>
