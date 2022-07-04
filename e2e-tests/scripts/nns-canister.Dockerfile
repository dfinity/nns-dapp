FROM rust:1.61.0 as builder

RUN rustup target add wasm32-unknown-unknown
RUN apt -yq update && \
    apt -yqq install --no-install-recommends build-essential pkg-config clang cmake && \
    apt autoremove --purge -y && \
    rm -rf /tmp/* /var/lib/apt/lists/* /var/tmp/*

RUN cargo install --version 0.3.2 ic-cdk-optimizer

ARG IC_COMMIT

RUN git clone https://github.com/dfinity/ic && \
    cd ic && \
    git reset --hard ${IC_COMMIT} && \
    rm -rf .git && \
    cd ..

RUN git config --global url."https://github.com/".insteadOf git://github.com/

# Modify the code to make testing easier:
# - Provide maturity more rapidly.
COPY nns-canister.patch /tmp/
RUN cd /ic && patch -p1 < /tmp/nns-canister.patch

RUN export CARGO_TARGET_DIR=/ic/rs/target && \
    cd ic/rs/ && \
    cargo fetch

ENV CARGO_TARGET_DIR=/ic/rs/target
WORKDIR /ic/rs

# Note: This is available as a download however we patch the source code to make testing easier.
# Note: The naming convention of the wasm files needs to match this:
#       https://github.com/dfinity/ic/blob/master/gitlab-ci/src/job_scripts/cargo_build_canisters.py#L82
#       Otherwise the built binary will simply not be deployed by ic-nns-init.
RUN binary=ledger-canister && \
    features="notify-method" && \
    cargo build --target wasm32-unknown-unknown --release -p "$binary" --features "$features"
RUN binary=ledger-canister && \
    features="notify-method" && \
    ls "$CARGO_TARGET_DIR/wasm32-unknown-unknown/release/" && \
    ic-cdk-optimizer -o "$CARGO_TARGET_DIR/${binary}_${features}.wasm" "$CARGO_TARGET_DIR/wasm32-unknown-unknown/release/${binary}.wasm"

# Note: This is available as a download however we patch the source code to make testing easier.
RUN binary="governance-canister" && \
    features="test" && \
    cargo build --target wasm32-unknown-unknown --release -p ic-nns-governance --features "$features"
RUN binary="governance-canister" && \
    features="test" && \
    ic-cdk-optimizer -o "$CARGO_TARGET_DIR/${binary}_${features}.wasm" "$CARGO_TARGET_DIR/wasm32-unknown-unknown/release/${binary}.wasm"

# Note: This is available as a download however we patch the source code to make testing easier.
RUN binary="cycles-minting-canister" && \
    cargo build --target wasm32-unknown-unknown --release -p "$binary"
RUN binary="cycles-minting-canister" && \
    ic-cdk-optimizer -o "$CARGO_TARGET_DIR/${binary}.wasm" "$CARGO_TARGET_DIR/wasm32-unknown-unknown/release/${binary}.wasm"

# Note: This is not yet available as a download so we have to build it.
RUN cd sns/swap && \
    cargo build --target wasm32-unknown-unknown --release
RUN binary="sns-swap-canister" && \
    ic-cdk-optimizer -o "$CARGO_TARGET_DIR/${binary}.wasm" "$CARGO_TARGET_DIR/wasm32-unknown-unknown/release/${binary}.wasm"


FROM scratch AS scratch
COPY --from=builder /ic/rs/rosetta-api/ledger.did /ledger.private.did
COPY --from=builder /ic/rs/rosetta-api/ledger_canister/ledger.did /ledger.public.did
COPY --from=builder /ic/rs/nns/governance/canister/governance.did /governance.did
COPY --from=builder /ic/rs/sns/swap/canister/swap.did /swap.did
COPY --from=builder /ic/rs/sns/root/canister/root.did /root.did
COPY --from=builder /ic/rs/target/*.wasm /
