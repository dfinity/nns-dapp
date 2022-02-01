<script lang="ts">
  const getICPs = () => {};

  let deployEnv: string = process.env.DEPLOY_ENV;
</script>

{#if deployEnv === "testnet"}
  <button on:click={getICPs}>Get ICPs</button>
{/if}

<style lang="scss">
  @use "../themes/mixins/button";

  button {
    @include button.header;

    justify-self: flex-start;
  }
</style>
