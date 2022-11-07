<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";

  // TODO(GIX-1071): this is a static generic temporary component that needs to be replace with designed, branded and useful content for each pages
  // TODO(GIX-1071): in particular case of the "Voting" screens, the list and details should be made public
</script>

<main>
  <h1>Network Nervous System (NNS)</h1>

  <p>
    The NNS is one of the world's largest DAOs that governs the Internet
    Computer. It is a 100% on-chain, permissionless system that continuously
    upgrades the Internet Computer based on the voting of ICP token holders.
  </p>

  <SignIn />
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
  }

  h1 {
    line-height: var(--line-height-standard);
  }

  p {
    margin-bottom: var(--padding-3x);
  }
</style>
