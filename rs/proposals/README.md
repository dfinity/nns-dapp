# Proposal Payload Rendering

This crate expresses a proposal payload as JSON, ready for rendering.

The conversion is lossy, with particularly long fields, such as Wasms, summarized. The focus is on expressing sufficient information for a human reader to check all significant details of a proposal.

## Usage

The library exposes a method that consumes the payload bytes and returns JSON. Please see [`src/main.rs`](src/main.rs) for an example of use.

## Development

Please see [`HACKING.md`](./HACKING.md)
