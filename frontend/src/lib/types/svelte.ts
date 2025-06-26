import type { Component } from "svelte";

export type ComponentWithProps = {
  Component: Component;
  props?: Record<string, unknown>;
};
