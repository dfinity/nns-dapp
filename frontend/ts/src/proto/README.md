# Protobuf Files

When making changes:

- First append '[jstype = JS_STRING];' on any numeric fields of size 64 bit or higher, otherwise the js 'number' type will be used for these fields which loses precision for numbers above 2^52.
- Run `update_proto.sh`
