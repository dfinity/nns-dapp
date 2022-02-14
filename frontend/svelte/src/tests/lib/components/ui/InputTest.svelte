<script>
  import Input from "../../../../lib/components/ui/Input.svelte";

  export let props = {};
</script>

<Input {...props}>
  <svelte:fragment slot="button">
    <button>Test Button</button>
  </svelte:fragment>
</Input>
