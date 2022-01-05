<script lang="ts">
  import Header from "./Header.svelte";
  import Nav from "./Nav.svelte";
</script>

<Header />

<Nav />

<slot />

<style lang="scss" global>
  @import "../themes/fonts.scss";
  @import "../themes/variables.scss";
  @import "../themes/theme.scss";
</style>
