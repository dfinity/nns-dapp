# Use this with
#
# docker build . -t nns-dapp
# container_id=$(docker create nns-dapp no-op)
# docker cp $container_id:nns-dapp.wasm nns-dapp.wasm
# docker rm --volumes $container_id

# Operating system with basic tools
FROM ubuntu:20.04 as base
SHELL ["bash", "-c"]
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    apt -yq update && \
    apt -yqq install --no-install-recommends curl ca-certificates \
        build-essential pkg-config libssl-dev llvm-dev liblmdb-dev clang cmake \
        git jq npm

# Gets tool versions.
#
# Note: This can be done in the builder but is slow because unrelated changes to dfx.json can cause a rebuild.
#
# Note: Here we play a bit with the idea of storing config in files, one file per parameter.
from base as tool_versions
SHELL ["bash", "-c"]
RUN mkdir -p config
COPY dfx.json dfx.json
ARG rust_version=1.64.0
ENV NODE_VERSION=16.17.1
RUN jq -r .dfx dfx.json > config/dfx_version
RUN printf "%s" "$NODE_VERSION" > config/node_version
RUN printf "%s" "$rust_version" > config/rust_version
RUN printf "%s" "0.3.1" > config/optimizer_version

# This is the "builder", i.e. the base image used later to build the final code.
FROM base as builder
SHELL ["bash", "-c"]
# Get tool versions
COPY --from=tool_versions /config/*_version config/
# Install node
RUN npm install -g n
RUN n "$(cat config/node_version)"
RUN node --version
RUN npm --version
# Install Rust and Cargo in /opt
ENV RUSTUP_HOME=/opt/rustup \
    CARGO_HOME=/opt/cargo \
    PATH=/opt/cargo/bin:$PATH
RUN curl --fail https://sh.rustup.rs -sSf \
        | sh -s -- -y --default-toolchain "$(cat config/rust_version)-x86_64-unknown-linux-gnu" --no-modify-path && \
    rustup default "$(cat config/rust_version)-x86_64-unknown-linux-gnu" && \
    rustup target add wasm32-unknown-unknown
ENV PATH=/cargo/bin:$PATH
# Install IC CDK optimizer
RUN cargo install --version "$(cat config/optimizer_version)" ic-cdk-optimizer
# Pre-build all cargo dependencies. Because cargo doesn't have a build option
# to build only the dependencies, we pretend that our project is a simple, empty
# `lib.rs`. Then we remove the dummy source files to make sure cargo rebuild
# everything once the actual source code is COPYed (and e.g. doesn't trip on
# timestamps being older)
WORKDIR /build
COPY Cargo.lock .
COPY Cargo.toml .
COPY rs/backend/Cargo.toml rs/backend/Cargo.toml
COPY rs/sns_aggregator/Cargo.toml rs/sns_aggregator/Cargo.toml
RUN mkdir -p rs/backend/src rs/sns_aggregator/src && touch rs/backend/src/lib.rs && touch rs/sns_aggregator/src/lib.rs && cargo build --target wasm32-unknown-unknown --release --package nns-dapp && rm -rf rs/backend/src rs/sns_aggregator/src
# Install dfx
WORKDIR /
RUN DFX_VERSION="$(cat config/dfx_version)" sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
RUN dfx --version

FROM builder AS build_frontend
ARG DFX_NETWORK=mainnet
RUN echo "DFX_NETWORK: '$DFX_NETWORK'"
SHELL ["bash", "-c"]
COPY ./frontend /build/frontend
COPY ./config.sh /build/
COPY ./build-frontend.sh /build/
COPY ./dfx.json /build/
COPY ./scripts/require-dfx-network.sh /build/scripts/
WORKDIR /build
RUN ( cd frontend && npm ci )
RUN export DFX_NETWORK && . config.sh && ./build-frontend.sh

FROM builder AS build_nnsdapp
ARG DFX_NETWORK=mainnet
RUN echo "DFX_NETWORK: '$DFX_NETWORK'"
SHELL ["bash", "-c"]
COPY ./rs /build/rs
COPY ./config.sh /build/
COPY ./build-backend.sh /build/
COPY ./build-rs.sh /build/
COPY ./Cargo.toml /build/
COPY ./Cargo.lock /build/
COPY ./dfx.json /build/
COPY --from=build_frontend /build/assets.tar.xz /build/
WORKDIR /build
RUN export DFX_NETWORK && ./build-backend.sh

FROM builder AS build_aggregate
SHELL ["bash", "-c"]
COPY ./rs /build/rs
COPY ./build-sns-aggregator.sh /build/build-sns-aggregator.sh
COPY ./build-rs.sh /build/build-rs.sh
COPY ./Cargo.toml /build/Cargo.toml
COPY ./Cargo.lock /build/Cargo.lock
COPY ./dfx.json /build/dfx.json
WORKDIR /build
RUN RUSTFLAGS="--cfg feature=\"reconfigurable\"" ./build-sns-aggregator.sh
RUN mv sns_aggregator.wasm sns_aggregator_dev.wasm
RUN ./build-sns-aggregator.sh

FROM scratch AS scratch
COPY --from=build_nnsdapp /build/nns-dapp.wasm /
COPY --from=build_nnsdapp /build/assets.tar.xz /
COPY --from=build_frontend /build/deployment-config.json /
COPY --from=build_frontend /build/frontend/.env /frontend-config.sh
COPY --from=build_aggregate /build/sns_aggregator.wasm /
COPY --from=build_aggregate /build/sns_aggregator_dev.wasm /
