import 'package:nns_dapp/ui/_components/custom_auto_size.dart';
import 'dart:html' as html;
import '../../nns_dapp.dart';

class AuthWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    html.window.location.replace('/v2/index.html');
    return Container(
      constraints: BoxConstraints.expand(),
      decoration: BoxDecoration(
        image: DecorationImage(
            image: AssetImage('assets/nns_background.jpeg'), fit: BoxFit.cover),
      ),
      child: Stack(
        children: [
          Container(
            padding: EdgeInsets.all(MediaQuery.of(context).size.width * 0.1),
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: 500),
                child: Column(
                  children: [
                    AutoSizeText(
                      'The Internet Computer',
                      style: context.textTheme.headline1,
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 20),
                    AutoSizeText(
                      'Network Nervous System',
                      style: context.textTheme.headline2,
                      textAlign: TextAlign.center,
                    ),
                    Expanded(child: Container()),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
