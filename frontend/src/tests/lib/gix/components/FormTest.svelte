<script lang="ts">
  import type { Component } from "svelte";

  interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: Component<any>;
    props?: Record<string, unknown>;
    onSubmit: () => void;
  }

  let { component: Cmp, props = {}, onSubmit }: Props = $props();

  const submit = ($event: SubmitEvent) => {
    $event.preventDefault();
    onSubmit();
  };
</script>

<form onsubmit={submit}>
  <Cmp {...props} />
</form>
