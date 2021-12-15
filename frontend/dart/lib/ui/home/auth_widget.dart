import 'package:nns_dapp/ui/_components/custom_auto_size.dart';
import 'dart:html' as html;
import '../../nns_dapp.dart';

class AuthWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    context.icApi.logout();
    html.window.location.assign('/v2/');
    return Container(
      constraints: BoxConstraints.expand(),
      decoration: BoxDecoration(
        image: DecorationImage(
            image: AssetImage('assets/nns_background.jpeg'), fit: BoxFit.cover),
      ),
    );
  }
}
