var fs = require('fs');
var gulp = require('gulp');

gulp.task('create-staging-config', function(cb) {
  fs.writeFile('src/config.json', JSON.stringify({
    IDENTITY_SERVICE_URL: "https://qsgjb-riaaa-aaaaa-aaaga-cai.xsmallh.dfinity.network/",
    HOST: "https://xsmallh.dfinity.network/",
    OWN_CANISTER_ID: "qhbym-qaaaa-aaaaa-aaafq-cai",
    FETCH_ROOT_KEY: false
  }), cb);
});

gulp.task('create-prod-config', function(cb) {
  fs.writeFile('src/config.json', JSON.stringify({
    IDENTITY_SERVICE_URL: "https://identity.ic0.app/",
    HOST: undefined,
    OWN_CANISTER_ID: "qoctq-giaaa-aaaaa-aaaea-cai",
    FETCH_ROOT_KEY: true
  }), cb);
});
