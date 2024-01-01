<ul><slot /></ul>

<style lang="scss">
  ul {
    list-style: none;
    padding: 0;

    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    margin-top: var(--padding);

    --checkbox-padding: 0;

    // fix unexpected scrollbars in voted and ineligible list.
    line-height: normal;
  }
</style>
