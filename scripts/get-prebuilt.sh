#!/usr/bin/env bash
set -euo pipefail
test -e master.tar.gz || {
  wget -nc 'https://github.com/dfinity/ic/archive/master.tar.gz'
  cat master.tar.gz | gunzip | tar -x
}
