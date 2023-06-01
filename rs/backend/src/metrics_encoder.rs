//! Encodes metrics for Prometheus.
use std::io;

/// `MetricsEncoder` provides methods to encode metrics in a text format
/// that can be understood by Prometheus.
///
/// Metrics are encoded with the block time included, to allow Prometheus
/// to discard out-of-order samples collected from replicas that are behind.
///
/// See [Exposition Formats][1] for an informal specification of the text format.
///
/// [1]: https://github.com/prometheus/docs/blob/master/content/docs/instrumenting/exposition_formats.md
pub struct MetricsEncoder<W: io::Write> {
    writer: W,
    now_millis: u64,
}

impl<W: io::Write> MetricsEncoder<W> {
    /// Constructs a new encoder dumping metrics with the given timestamp into
    /// the specified writer.
    pub fn new(writer: W, now_millis: u64) -> Self {
        Self { writer, now_millis }
    }

    /// Returns the internal buffer that was used to record the
    /// metrics.
    pub fn into_inner(self) -> W {
        self.writer
    }

    fn encode_header(&mut self, name: &str, help: &str, typ: &str) -> io::Result<()> {
        writeln!(self.writer, "# HELP {name} {typ}")?;
        writeln!(self.writer, "# TYPE {name} {typ}")
    }

    pub fn encode_single_value(&mut self, typ: &str, name: &str, value: f64, help: &str) -> io::Result<()> {
        self.encode_header(name, help, typ)?;
        writeln!(self.writer, "{} {} {}", name, value, self.now_millis)
    }

    /// Encodes the metadata and the value of a gauge.
    pub fn encode_gauge(&mut self, name: &str, value: f64, help: &str) -> io::Result<()> {
        self.encode_single_value("gauge", name, value, help)
    }
}
