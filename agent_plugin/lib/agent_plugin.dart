@JS()
library agent_plugin;

import 'package:flutter/services.dart';
import 'package:import_js_library/import_js_library.dart';
import 'package:js/js.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';


void initializeAgentJS(){
  importJsLibrary(url: "./assets/dfinity-agent.js", flutterPluginName: "agent_plugin");
}

// class AudioPlugin {
//
//   static void registerWith(Registrar registrar) {
//     // final MethodChannel channel = MethodChannel(
//     //   'dfinity.agent_plugin',
//     //   const StandardMethodCodec(),
//     //   registrar,
//     // );
//
//     importJsLibrary(url: "./assets/dfinity-agent.js", flutterPluginName: "dfinity.agent_plugin");
//   }
// }

// @JS("AnonymousIdentity")
// class AnonymousIdentity{
//   Principal getPrincipal() {
//     return Principal.anonymous();
// }
//
// }

//
// String testFunction() {
//   return js.testFunction();
// }

//
// @JS("Principal")
// class Principal {
//   external static Principal anonymous();
//   external bool isAnonymous();
// }