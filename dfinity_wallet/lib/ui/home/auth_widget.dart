import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/home/nodes/node_world.dart';

import '../../dfinity.dart';
import 'package:auto_size_text/auto_size_text.dart';

class AuthWidget extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        NodeWorld(),
        Container(
          padding: EdgeInsets.all(MediaQuery
              .of(context)
              .size
              .width * 0.1),
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: 500),
              child: Column(
                children: [
                  AutoSizeText(
                    "The Internet Computer", style: context.textTheme.headline1, textAlign: TextAlign.center,),
                  Expanded(child: Container()),
                  ElevatedButton(
                      child: Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Text("Authenticate", style: context.textTheme.bodyText2?.copyWith(fontSize: 32),),
                      ),
                      style: ButtonStyle(backgroundColor: MaterialStateProperty.all(AppColors.gray1000)),
                      onPressed: () {
                        final signingService = SigningService.of(context).platformSigningService;
                        signingService.createAddressForTag("");
                      }),
                  SmallFormDivider(),
                  TextButton(
                      style: ButtonStyle(overlayColor: MaterialStateProperty.all(AppColors.white.withOpacity(0.3))),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text("Bypass", style: context.textTheme.button),
                      ),
                      onPressed: () async{
                        await 0.2.seconds.delay;
                        context.nav.push(HomeTabsPageConfiguration);
                  })
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
