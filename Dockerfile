# Use this with
#
# docker build . -t nns-dapp
# container_id=$(docker create nns-dapp no-op)
# docker cp $container_id:nns-dapp.wasm nns-dapp.wasm
# docker rm --volumes $container_id

# This is the "builder", i.e. the base image used later to build the final
# code.
FROM ubuntu:20.04 as builder
SHELL ["bash", "-c"]

ARG rust_version=1.58.1
ENV NODE_VERSION=16.13.2

ENV TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    apt -yq update && \
    apt -yqq install --no-install-recommends curl ca-certificates \
        build-essential pkg-config libssl-dev llvm-dev liblmdb-dev clang cmake \
        git jq

# Install node
RUN curl --fail -sSf https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# Install Rust and Cargo in /opt
ENV RUSTUP_HOME=/opt/rustup \
    CARGO_HOME=/opt/cargo \
    PATH=/opt/cargo/bin:$PATH

RUN curl --fail https://sh.rustup.rs -sSf \
        | sh -s -- -y --default-toolchain ${rust_version}-x86_64-unknown-linux-gnu --no-modify-path && \
    rustup default ${rust_version}-x86_64-unknown-linux-gnu && \
    rustup target add wasm32-unknown-unknown

ENV PATH=/cargo/bin:$PATH

# Install IC CDK optimizer
RUN cargo install --version 0.3.1 ic-cdk-optimizer

# Pre-build all cargo dependencies. Because cargo doesn't have a build option
# to build only the dependecies, we pretend that our project is a simple, empty
# `lib.rs`. Then we remove the dummy source files to make sure cargo rebuild
# everything once the actual source code is COPYed (and e.g. doesn't trip on
# timestamps being older)
COPY Cargo.lock .
COPY Cargo.toml .
COPY rs/Cargo.toml rs/Cargo.toml
COPY rs/nns_functions_candid_gen ./rs/nns_functions_candid_gen
RUN mkdir -p rs/src && touch rs/src/lib.rs && cargo build --target wasm32-unknown-unknown --release --package nns-dapp && rm -rf rs/src

# Install dfx
COPY dfx.json dfx.json
RUN DFX_VERSION="$(jq -cr .dfx dfx.json)" sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Start the second container
FROM builder AS build
SHELL ["bash", "-c"]
ARG DEPLOY_ENV=mainnet
RUN echo "DEPLOY_ENV: '$DEPLOY_ENV'"

ARG OWN_CANISTER_ID
RUN echo "OWN_CANISTER_ID: '$OWN_CANISTER_ID'"

ARG REDIRECT_TO_LEGACY
RUN echo "REDIRECT_TO_LEGACY: '$REDIRECT_TO_LEGACY'"

# Build
# ... put only git-tracked files in the build directory
COPY . /build
WORKDIR /build
RUN find . -type f | sed 's/^..//g' > ../build-inputs.txt
RUN ./build.sh

RUN ls -sh nns-dapp.wasm; sha256sum nns-dapp.wasm

FROM scratch AS scratch
COPY --from=build /build/nns-dapp.wasm /
COPY --from=build /build/assets.tar.xz /
COPY --from=build /build-inputs.txt /
