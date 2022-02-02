<script>
  import Logout from "./Logout.svelte";
  import { i18n } from "../stores/i18n";

  console.log('$$slots', $$slots);
</script>

<footer>
  <slot></slot>
</footer>

<style lang="scss">
  @use "../themes/mixins/img";

  footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    height: var(--section-footer-height);

    display: flex;
    justify-content: center;
    align-items: end;

    background: var(--background);
    background: linear-gradient(0deg, rgba(11,12,12,1) 10%, rgba(11,12,12,0) 100%);
  }

  footer :global(button) {
    // TODO: remove <tmp_styles>
    background: var(--blue-400);
    padding: 10px;
    border-radius: 10px;
    color: white;
    // </tmp_styles>

    margin: 25px 10px;
    width: 186px;
    
    @media (min-width: 768px) {
      margin: 30px 40px;
      width: 436px;
    }
  }

</style>
