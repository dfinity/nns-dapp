import Plausible from "plausible-tracker";

const domain = "nns.ic0.app";

const plausible = Plausible({
  domain,
  hashMode: false,
  // It can be changed to true to see the traffic reaching https://plausible.io/nns.ic0.app
  trackLocalhost: false,
});

export const { enableAutoPageviews, enableAutoOutboundTracking } = plausible;
