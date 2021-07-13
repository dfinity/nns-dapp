import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import '../../../dfinity.dart';

class NeuronHotkeysCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronHotkeysCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final buttonStyle = ButtonStyle(
        foregroundColor: MaterialStateProperty.all(AppColors.white),
        minimumSize: MaterialStateProperty.all(Size.square(40)));
    return Card(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Hotkeys", style: context.textTheme.headline3),
                SmallFormDivider(),
                if (neuron.hotkeys.isEmpty)
                  Center(
                      child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      "no hotkeys",
                      style: context.textTheme.bodyText1,
                    ),
                  )),
                if (neuron.hotkeys.isNotEmpty)
                  ...neuron.hotkeys.map((e) {
                    return Container(
                      padding: EdgeInsets.all(8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: SelectableText(e,
                                style: context.textTheme.bodyText2),
                            flex: 4,
                          ),
                          TextButton(
                              style: buttonStyle,
                              onPressed: () {
                                removeHotkey(e, context);
                              },
                              child: Text('✕'))
                        ],
                      ),
                    );
                  }),
              ],
            ),
            ElevatedButton(
                onPressed: () {
                  OverlayBaseWidget.show(
                      context,
                      WizardOverlay(
                          rootTitle: "HotKey",
                          rootWidget: AddHotkeys(
                              neuron: neuron,
                              onCompleteAction: (context) {
                                OverlayBaseWidget.of(context)?.dismiss();
                              })));
                }.takeIf((e) => neuron.isCurrentUserController),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Text(
                    "Add Hotkey",
                    textScaleFactor: Responsive.isMobile(context) ? 0.75 : 1,
                  ),
                )),
          ],
        ),
      ),
    );
  }

  void removeHotkey(String Hotkey, BuildContext context) {
    context.callUpdate(() async {
      await context.icApi
          .removeHotkey(neuronId: neuron.id.toBigInt, principal: Hotkey);
      return true;
    });
  }
}

class AddHotkeys extends StatefulWidget {
  final Neuron neuron;
  final Function(BuildContext context) onCompleteAction;

  const AddHotkeys({required this.neuron, required this.onCompleteAction});

  @override
  _AddHotkeysState createState() => _AddHotkeysState();
}

class _AddHotkeysState extends State<AddHotkeys> {
  String Hotkey = '';
  late ValidatedTextField HotkeyValidated;

  @override
  void initState() {
    super.initState();
    HotkeyValidated = ValidatedTextField(Hotkey,
        validations: [StringFieldValidation.minimumLength(58)]);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        Padding(
          padding: const EdgeInsets.all(40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Enter Hotkey : ',
                  style: Responsive.isDesktop(context) |
                          Responsive.isTablet(context)
                      ? context.textTheme.headline3
                      : context.textTheme.headline4),
              SizedBox(
                height: 50.0,
              ),
              DebouncedValidatedFormField(
                HotkeyValidated,
                onChanged: () {
                  Hotkey = HotkeyValidated.currentValue;
                },
              ),
            ],
          ),
        ),
        Container(
          width: double.infinity,
          color: AppColors.lightBackground,
          height: 100,
          padding: Responsive.isMobile(context)
              ? EdgeInsets.symmetric(horizontal: 30, vertical: 16)
              : EdgeInsets.symmetric(horizontal: 64, vertical: 16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: ValidFieldsSubmitButton(
                  child: Text(
                    'Confirm',
                    textScaleFactor: Responsive.isMobile(context) ? 0.75 : 1,
                  ),
                  fields: [HotkeyValidated],
                  onPressed: () async {
                    widget.neuron.hotkeys.add(Hotkey);
                    await context.callUpdate(() => context.icApi.addHotkey(
                        neuronId: widget.neuron.id.toBigInt,
                        principal: Hotkey));

                    widget.onCompleteAction(context);
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
