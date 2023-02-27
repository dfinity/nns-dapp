<script lang="ts">
  import { ProgressSteps } from "@dfinity/gix-components";

  let steps = [
    {
      id: Symbol(1),
      text: "Connection with sale canister",
      state: "completed",
    },
    {
      id: Symbol(2),
      text: "Sending tokens",
      state: "completed",
    },
    {
      id: Symbol(3),
      text: "Confirming your participation...",
      state: "in_progress",
    },
    {
      id: Symbol(4),
      text: "Updating your data",
      state: "next",
    },
  ];
</script>

<div class="warning">
  <p class="value">This may take a few minutes</p>
  <p class="description">Please do not close your browser tab</p>
</div>

<ProgressSteps {steps} />

<style lang="scss">
  .warning {
    background: var(--overlay-background);
    color: var(--overlay-background-contrast);
    padding: var(--padding) var(--padding-3x);
    border-radius: var(--border-radius);

    margin: 0 0 var(--padding-4x);
  }
</style>
