import 'package:core/core.dart';
import 'package:dfinity_wallet/data/canister.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/page_button.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/canisters/select_canister_add_action_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/ui.dart';
import 'package:dfinity_wallet/dfinity.dart';

class CansitersPage extends StatefulWidget {
  @override
  _CansitersPageState createState() => _CansitersPageState();
}

class _CansitersPageState extends State<CansitersPage> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    context.icApi.getCanisters();
  }

  @override
  Widget build(BuildContext context) {
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
                            .mapToList((e) => CanisterRow(
                                  canister: e,
                                  showsWarning: true,
                                  onPressed: () {
                                    context.nav.push(
                                        CanisterPageDef.createPageConfig(e));
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

class CanisterRow extends StatelessWidget {
  final Canister canister;
  final bool showsWarning;
  final VoidCallback onPressed;

  const CanisterRow(
      {Key? key,
      required this.canister,
      required this.onPressed,
      this.showsWarning = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: FlatButton(
        onPressed: onPressed,
        child: Container(
          width: double.infinity,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  canister.name,
                  style: context.textTheme.headline3,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: 16.0, bottom: 16.0, right: 16.0),
                child: Text(
                  canister.identifier,
                  style: context.textTheme.bodyText1,
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
