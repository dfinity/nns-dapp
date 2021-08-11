import 'package:dfinity_wallet/ui/home/landing_widget.dart';

import 'dfinity.dart';

class ResourcesLoadingPageConfig extends PageConfig {
  final Future<PageConfig> destinationPage;
  final Future<bool> loadDestinationResources;
  bool logoutOnFailure;

  ResourcesLoadingPageConfig(
      this.destinationPage, this.loadDestinationResources,
      {required this.logoutOnFailure})
      : super(loadingPage.path);

  @override
  Widget createWidget() {
    return LandingPageWidget();
  }
}

// class ResourcesLoadingWidget extends StatefulWidget {
//   final Future<PageConfig> destinationPage;
//   final Future<bool> hasValidAuthToken;
//
//   const ResourcesLoadingWidget({Key? key, required this.destinationPage, required this.hasValidAuthToken})
//       : super(key: key);
//
//   @override
//   _ResourcesLoadingWidgetState createState() => _ResourcesLoadingWidgetState();
// }
//
// class _ResourcesLoadingWidgetState extends State<ResourcesLoadingWidget> {
//   @override
//   Widget build(BuildContext context) {
//     return LandingPageWidget();
//   }
//
//   @override
//   void initState() {
//     super.initState();
//     if(redirected == false){
//       redirected = true;
//       redirectWhenLoaded();
//     }
//   }
//
//   bool redirected = false;
//
//   void redirectWhenLoaded() async {
//     final isLoggedIn = await widget.hasValidAuthToken;
//     if(isLoggedIn){
//       final destination = await widget.destinationPage;
//       context.nav.push(destination);
//     }else{
//       context.nav.push(AuthPage);
//     }
//   }
// }
