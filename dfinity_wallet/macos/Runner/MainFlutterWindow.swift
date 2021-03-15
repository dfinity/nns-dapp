import Cocoa
import FlutterMacOS

class MainFlutterWindow: NSWindow {
    
    let signingManager = SigningManager()
    
  override func awakeFromNib() {
    let flutterViewController = FlutterViewController.init()
    let windowFrame = self.frame
    self.contentViewController = flutterViewController
    self.setFrame(windowFrame, display: true)

    RegisterGeneratedPlugins(registry: flutterViewController)
    
        
    let channel = FlutterMethodChannel(
        name: "internet_computer.signing",
        binaryMessenger: flutterViewController.engine.binaryMessenger
        )
    
    channel.setMethodCallHandler({
        (call: FlutterMethodCall, result: @escaping FlutterResult) -> Void in
        self.signingManager.handleCall(call: call, result: result)
    })

    super.awakeFromNib()
  }
}


