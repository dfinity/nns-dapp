<script lang="ts">
  import Route from "./lib/components/Route.svelte";
  import PrivateRoute from "./lib/components/PrivateRoute.svelte";
  import Guard from "./lib/components/Guard.svelte";
  import Accounts from "./routes/Accounts.svelte";
  import Neurons from "./routes/Neurons.svelte";
  import Voting from "./routes/Voting.svelte";
  import Canisters from "./routes/Canisters.svelte";
  import Auth from "./routes/Auth.svelte";
</script>

<svelte:head>
  {#if !process.env.ROLLUP_WATCH}
    <!-- This is just a default; need to examine the CSP carefully and lock down accordingly. -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; child-src 'none';"
    />
  {/if}

  <base href={process.env.BASE_HREF} />
</svelte:head>

<Guard>
  <Route path="/" component={Auth} />
  <PrivateRoute path="/#/accounts" component={Accounts} />
  <PrivateRoute path="/#/neurons" component={Neurons} />
  <PrivateRoute path="/#/voting" component={Voting} />
  <PrivateRoute path="/#/canisters" component={Canisters} />
</Guard>

<style lang="scss" global>
  @import "./lib/themes/fonts.scss";
  @import "./lib/themes/variables.scss";
  @import "./lib/themes/theme.scss";
</style>
