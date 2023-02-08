#!/usr/bin/env bash
set -euxo pipefail

: Check that the principal is correct
[[ "$(dfx identity get-principal --identity sns-subnet)" == "wgfa2-l65ry-bjl6l-idehu-56rsz-srpsc-km5fe-jgglp-p5up7-npbep-5ae" ]] || {
	echo Bad principal
	exit 1
}


NEURON=36

cargo run --bin ic-admin -- --nns-url https://nns.ic0.app/ \
	--use-hsm \
	--pin $(cat ~/.hsm-pin) \
	--key-id 01 \
	--slot 0 \
	propose-to-set-authorized-subnetworks \
	--proposer "$NEURON" \
        --summary-file sns_principal.md \
	--subnets x33ed-h457x-bsgyx-oqxqf-6pzwv-wkhzr-rm2j3-npodi-purzm-n66cg-gae \
	--who wgfa2-l65ry-bjl6l-idehu-56rsz-srpsc-km5fe-jgglp-p5up7-npbep-5ae


