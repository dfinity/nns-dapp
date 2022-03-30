import 'package:core/core.dart';
import 'package:nns_dapp/ui/_components/constrain_width_and_center.dart';
import 'package:nns_dapp/ui/_components/custom_auto_size.dart';
import 'package:nns_dapp/ui/_components/footer_gradient_button.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/page_button.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/_components/tab_title_and_content.dart';
import 'package:nns_dapp/ui/transaction/wizard_overlay.dart';
import 'package:nns_dapp/data/env.dart' as env;
import 'package:universal_html/html.dart' as html;
import '../../nns_dapp.dart';
import '../../wallet_router_delegate.dart';
import 'select_canister_add_action_widget.dart';

class CanistersPage extends StatefulWidget {
  @override
  _CanistersPageState createState() => _CanistersPageState();
}

class _CanistersPageState extends State<CanistersPage> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    context.icApi.getCanisters();
  }

  @override
  Widget build(BuildContext context) {
    if (!env.showCanistersRoute()) {
      html.window.location.replace("/v2/#/canisters");
      return Text('Redirecting...');
    }
    return StreamBuilder(
        stream: context.boxes.canisters.changes,
        builder: (context, snapshot) {
          return Column(
            children: [
              Expanded(
                child: FooterGradientButton(
                  footerHeight: null,
                  body: ConstrainWidthAndCenter(
                    child: TabTitleAndContent(
                      title: "Canisters",
                      subtitle:
                          '''Canisters are computational units (a form of smart contracts). They are powered by “cycles”, which they must be pre-charged with. You create cycles by converting ICP tokens.

• Create new canisters

• Link canisters to your account

• Send cycles to canisters

Your principal id is "${context.icApi.getPrincipal()}"''',
                      children: [
                        SmallFormDivider(),
                        ...context.boxes.canisters.values
                            .mapToList((e) => CanisterColumn(
                                  canister: e,
                                  showsWarning: true,
                                  onPressed: () {
                                    context.nav.push(
                                        canisterPageDef.createPageConfig(e));
                                  },
                                )),
                        SizedBox(
                          height: 200,
                        )
                      ],
                    ),
                  ),
                  footer: Align(
                    alignment: Alignment.bottomCenter,
                    child: IntrinsicHeight(
                      child: PageButton(
                        title: "Create or Link Canister",
                        onPress: () {
                          OverlayBaseWidget.show(
                            context,
                            WizardOverlay(
                              rootTitle: "Add Canister",
                              rootWidget: SelectCanisterAddActionWidget(),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              )
            ],
          );
        });
  }
}

class CanisterColumn extends StatelessWidget {
  final Canister canister;
  final bool showsWarning;
  final VoidCallback onPressed;

  const CanisterColumn(
      {Key? key,
      required this.canister,
      required this.onPressed,
      this.showsWarning = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: TextButton(
        onPressed: onPressed,
        child: Container(
          width: double.infinity,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: AutoSizeText(
                  canister.name,
                  maxLines: 1,
                  style: Responsive.isMobile(context)
                      ? context.textTheme.headline6
                      : context.textTheme.headline3,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: 16.0, bottom: 16.0, right: 16.0),
                child: Text(
                  canister.identifier,
                  style: Responsive.isMobile(context)
                      ? context.textTheme.bodyText2
                      : context.textTheme.bodyText1,
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
