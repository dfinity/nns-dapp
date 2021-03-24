
import '../dfinity.dart';

abstract class AbstractPlatformICApi {
    void authenticate(BuildContext context);
    Future<void> buildServices(BuildContext context);
}