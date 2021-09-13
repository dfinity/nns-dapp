import 'package:nns_dapp/ui/_components/confirm_dialog.dart';
import 'package:nns_dapp/ui/_components/constants.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/_components/valid_fields_submit_button.dart';

import '../../nns_dapp.dart';

class ChangeCanisterControllerWidget extends StatefulWidget {
  final Canister canister;

  ChangeCanisterControllerWidget({Key? key, required this.canister})
      : super(key: key);

  @override
  _ChangeCanisterControllerWidgetState createState() =>
      _ChangeCanisterControllerWidgetState();
}

class _ChangeCanisterControllerWidgetState
    extends State<ChangeCanisterControllerWidget> {
  @override
  Widget build(BuildContext context) {
    widget.canister.controllers!.add('');
    final controllerTextFields = widget.canister.controllers.map((e) =>
        ValidatedTextField(e,
            validations: [StringFieldValidation.minimumLength(0)]));

    for (int i = 0; i < controllerTextFields.length; i++) {
      controllerTextFields[i].initialText = widget.canister.controllers![i];
      // print('controller value :${controllerTextFields[i].currentValue} \n');
      // print('widget controller values :${widget.canister.controllers![i]} \n');
    }

    return SingleChildScrollView(
      child: Padding(
          padding: const EdgeInsets.all(32.0),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
            Text("Update Controllers",
                style: Responsive.isMobile(context)
                    ? context.textTheme.headline4
                    : context.textTheme.headline3),
            Text("\nSpecify the new controller(s) of the canister."),
            ..._getValidatedControllerFields(),
            SizedBox(
              height: 70,
              width: double.infinity,
              child: ValidFieldsSubmitButton(
                child: Text("Perform Controller Change"),
                onPressed: () async {
                  for (int i = 0; i < controllerTextFields.length; i++) {
                    controllerTextFields[i].initialText =
                        widget.canister.controllers![i];
                  }
                  confirmControllerChange(context, controllerTextFields);
                },
                fields: controllerTextFields,
              ),
            ),
          ])),
    );
  }

  Future confirmControllerChange(BuildContext context,
      List<ValidatedTextField> controllerTextFields) async {
    final newControllers = controllerTextFields
        .map((e) => e.currentValue.trim())
        .filter((e) => e != "")
        .toList();

    for (int i = 0; i < controllerTextFields.length; i++)
      print(
          'Perform ControllerChange value $i is : ${controllerTextFields[i].currentValue} \n ');

    OverlayBaseWidget.show(
        context,
        ConfirmDialog(
          title: "Confirm Change of Controllers",
          description: newControllers.isNotEmpty
              ? "The controllers of canister ${widget.canister.identifier} will be updated to the following:\n\n${newControllers.join("\n")}\n\nAre you sure?"
              : "WARNING: All controllers of canister ${widget.canister.identifier} will be removed. Are you sure?",
          onConfirm: () async {
            try {
              await context.callUpdate(() => context.icApi
                  .changeCanisterControllers(
                      widget.canister.identifier, newControllers));
            } catch (err) {
              // TODO(NU-71): Display error message in case of failure.
              print(err);
            }
            OverlayBaseWidget.of(context)?.dismiss();
          },
        ));
  }

  List<Widget> _getValidatedControllerFields() {
    List<Widget> updateControllersTextFields = [];
    print(
        'Widget controller length now is : ${widget.canister.controllers!.length}');
    if (widget.canister.controllers != null) {
      for (int i = 0; i < widget.canister.controllers!.length; i++) {
        updateControllersTextFields.add(Row(
          children: [
            Text(
              '${i + 1}.',
              style: Responsive.isMobile(context)
                  ? context.textTheme.headline4
                  : context.textTheme.headline3,
            ),
            SizedBox(width: Responsive.isMobile(context) ? 5 : 16),
            Expanded(
                child: ControllerTextFields(widget.canister.controllers, i)),
            SizedBox(width: Responsive.isMobile(context) ? 5 : 16),
            i < kTotalNumberOfControllersAllowed - 1
                ? _addRemoveButton(
                    i == widget.canister.controllers!.length - 1, i)
                : _addRemoveButton(false, i),
          ],
        ));
      }
    }
    return updateControllersTextFields;
  }

  Widget _addRemoveButton(bool add, int index) {
    return InkWell(
      onTap: () {
        if (add) {
          if (widget.canister.controllers!.length <=
              kTotalNumberOfControllersAllowed - 2) {
            index = index + 2;
            widget.canister.controllers!.length++;
            add = false;
          }
        } else {
          widget.canister.controllers!.removeAt(index);
          widget.canister.controllers!.length--;
        }

        setState(() {});
      },
      child: Container(
        padding: EdgeInsets.all(5.0),
        decoration: BoxDecoration(
          color: AppColors.gray800,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          (add) ? Icons.add : Icons.remove,
          size: Responsive.isMobile(context) ? 17 : 20,
          color: Colors.white,
        ),
      ),
    );
  }
}

class ControllerTextFields extends StatefulWidget {
  final List<String>? controllers;
  final int index;

  ControllerTextFields(this.controllers, this.index);
  @override
  _ControllerTextFieldsState createState() => _ControllerTextFieldsState();
}

class _ControllerTextFieldsState extends State<ControllerTextFields> {
  late TextEditingController _nameController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    _nameController.text = widget.controllers?[widget.index] ?? '';

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextFormField(
        controller: _nameController,
        onChanged: (v) => widget.controllers![widget.index] = v,
        style: Responsive.isDesktop(context) | Responsive.isTablet(context)
            ? context.textTheme.subtitle1
            : context.textTheme.subtitle2,
        decoration: InputDecoration(
          hintText: 'Enter controller',
          hintStyle:
              Responsive.isDesktop(context) | Responsive.isTablet(context)
                  ? context.textTheme.subtitle1
                  : context.textTheme.subtitle2,
          contentPadding: EdgeInsets.only(left: 20, top: 25, bottom: 25),
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(100),
              borderSide: BorderSide(width: 1, color: AppColors.white)),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(100),
              borderSide: BorderSide(width: 1, color: AppColors.white)),
        ),
      ),
    );
  }
}
