# SNS test projects

`scripts/icp-network-start` creates four SNS projects on the local network with `scripts/icp-sns-create`. The end-to-end tests `sns-participation.spec.ts` and `sns-governance.spec.ts` expect them.

| Project       | Symbol | Swap      | Logo                |
| ------------- | ------ | --------- | ------------------- |
| Alfa Centauri | ALF    | Committed | `alfa-centauri.png` |
| Delta         | DLT    | Committed | `delta.png`         |
| Bravo         | BRV    | Open      | `bravo.png`         |
| Charlie       | CHR    | Open      | `charlie.png`       |

Each project comes from a `CreateServiceNervousSystem` proposal of the large NNS neuron of the anonymous principal. The neuron has the majority, so the NNS adopts and executes the proposal at once. The local NNS governance is a test build, so a swap opens at once instead of a day later. An open swap closes after 14 days, the longest duration that the swap canister accepts. Stop and start the network to get new swaps.

The anonymous principal buys the whole swap of a committed project. The swap finalizes itself and gives the buyer two neurons. The script disburses the neuron without dissolve delay and sends the tokens to the test account of the "Get tokens" menu, see `frontend/src/lib/api/dev.api.ts`. The anonymous principal also has a developer neuron of 1 token in each project.

A swap accepts 1 to 1000 ICP from a participant and commits at 1000 ICP in total.
