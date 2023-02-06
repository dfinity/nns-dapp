# Allow GIX team to deploy canisters to the SNS subnet

This proposal will allow a principal, controlled by the Dfinity GIX team, to deploy
canisters to the SNS subnet.

The GIX team is the team that develops and maintains the internet identity (https://identity.ic0.app)
and NNS frontend dapp (https://nns.ic0.app).  In particular, the NNS frontend dapp shows information
about current SNS projects.  The team would like to create a canister that aggregates data from all
dapps that have been, or are being, decentralized via SNS so that this data can be displayed in web
browsers with low latency and with minimal load on the network.

Note that the SNS subnet is a normal application subnet, with restricted access.  All SNS canisters
deployed to this subnet must pay for their work with cycles.  Canisters deployed by the GIX team are
no exception.

The principal that the GIX team would like to use is: wgfa2-l65ry-bjl6l-idehu-56rsz-srpsc-km5fe-jgglp-p5up7-npbep-5ae

