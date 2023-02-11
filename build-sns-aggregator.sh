#!/usr/bin/env bash
set -euxo pipefail
cd "$(dirname "$(realpath "$0")")"
./build-rs.sh sns_aggregator
