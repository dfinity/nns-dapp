//! Methods for serializing and deserializing schema labels.
use super::{SchemaLabel, SchemaLabelBytes, SchemaLabelError};
use ic_crypto_sha::Sha256;
use std::convert::{TryFrom, TryInto};

#[cfg(test)]
mod tests;

/// Internal type for just the serialized schema label without a checksum.
type SchemaBytesWithoutChecksum = [u8; SchemaLabel::LABEL_BYTES];

impl SchemaLabel {
    /// When serialized, the offset of the bytes containing the label.
    pub const LABEL_OFFSET: usize = 0;
    /// The number of bytes needed to store just the schema label.
    pub const LABEL_BYTES: usize = 4;
    /// When serialized, the offset of the bytes containing the checksum, if included.
    pub const CHECKSUM_OFFSET: usize = Self::LABEL_BYTES;
    /// The length of the SHA256 checksum of the schema label.
    pub const CHECKSUM_BYTES: usize = 32;
    /// The number of bytes needed to store the schema label and its checksum.
    pub const MAX_BYTES: usize = Self::CHECKSUM_OFFSET + Self::CHECKSUM_BYTES;
    /// String used to distinguish this checksum from checksums for other purposes.
    pub const DOMAIN_SEPARATOR: &'static [u8; 12] = b"schema-label";

    /// Checksum of the label.
    fn checksum(self_bytes: &[u8; Self::LABEL_BYTES]) -> [u8; Self::CHECKSUM_BYTES] {
        let mut state = Sha256::new();
        state.write(Self::DOMAIN_SEPARATOR);
        state.write(self_bytes);
        state.finish()
    }

    /// Adds a checksum to the label bytes.
    fn with_checksum(label_bytes: SchemaBytesWithoutChecksum) -> SchemaLabelBytes {
        let mut bytes = [0u8; SchemaLabel::MAX_BYTES];
        bytes[SchemaLabel::LABEL_OFFSET..SchemaLabel::LABEL_OFFSET + SchemaLabel::LABEL_BYTES]
            .copy_from_slice(&label_bytes);
        let checksum = SchemaLabel::checksum(&label_bytes);
        bytes[SchemaLabel::CHECKSUM_OFFSET..SchemaLabel::CHECKSUM_OFFSET + SchemaLabel::CHECKSUM_BYTES]
            .copy_from_slice(&checksum);
        bytes
    }
}

impl TryFrom<u32> for SchemaLabel {
    type Error = SchemaLabelError;
    fn try_from(value: u32) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Map),
            #[cfg(test)]
            1 => Ok(Self::AccountsInStableMemory),
            _ => Err(SchemaLabelError::InvalidLabel),
        }
    }
}

impl From<SchemaLabel> for SchemaBytesWithoutChecksum {
    fn from(label: SchemaLabel) -> [u8; SchemaLabel::LABEL_BYTES] {
        (label as u32).to_le_bytes()
    }
}

impl TryFrom<&SchemaBytesWithoutChecksum> for SchemaLabel {
    type Error = SchemaLabelError;
    fn try_from(value: &[u8; SchemaLabel::LABEL_BYTES]) -> Result<Self, Self::Error> {
        let label_num = u32::from_le_bytes(*value);
        Self::try_from(label_num)
    }
}

impl From<SchemaLabel> for SchemaLabelBytes {
    fn from(label: SchemaLabel) -> [u8; SchemaLabel::MAX_BYTES] {
        let label_bytes = SchemaBytesWithoutChecksum::from(label);
        SchemaLabel::with_checksum(label_bytes)
    }
}

impl TryFrom<&SchemaLabelBytes> for SchemaLabel {
    type Error = SchemaLabelError;
    fn try_from(value: &[u8; SchemaLabel::MAX_BYTES]) -> Result<Self, Self::Error> {
        let label_bytes: [u8; SchemaLabel::LABEL_BYTES] = value
            [SchemaLabel::LABEL_OFFSET..SchemaLabel::LABEL_OFFSET + SchemaLabel::LABEL_BYTES]
            .try_into()
            .map_err(|_| SchemaLabelError::InsufficientBytes)?;
        let actual_checksum =
            &value[SchemaLabel::CHECKSUM_OFFSET..SchemaLabel::CHECKSUM_OFFSET + SchemaLabel::CHECKSUM_BYTES];
        let expected_checksum = Self::checksum(&label_bytes);
        if expected_checksum == *actual_checksum {
            Self::try_from(&label_bytes)
        } else {
            Err(SchemaLabelError::InvalidChecksum)
        }
    }
}

impl TryFrom<&[u8]> for SchemaLabel {
    type Error = SchemaLabelError;
    fn try_from(value: &[u8]) -> Result<Self, Self::Error> {
        let bytes: &SchemaLabelBytes = value
            .chunks(SchemaLabel::MAX_BYTES)
            .next()
            .ok_or(SchemaLabelError::InsufficientBytes)? // Zero bytes lead to no chunks.
            .try_into()
            .map_err(|_| SchemaLabelError::InsufficientBytes)?; // There are some bytes but not enough to make a full chunk.
        Self::try_from(bytes)
    }
}
