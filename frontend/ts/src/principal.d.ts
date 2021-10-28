declare global {
    module "@dfinity/principal" {
        interface Principal {
            // By default, when Principals are serialized to JSON they are displayed as bytes, but this isn't very
            // human-readable. By adding this extension we are able to override the JSON serialization to output the
            // Principals as hex strings (eg. "7pmrq-pixv3-iz43b-cs7av-ksmiz-lywsr-oavhz-6x6rn-zbgwl-vtgyj-3qe").
            toJSON(): string;
        }
    }
}