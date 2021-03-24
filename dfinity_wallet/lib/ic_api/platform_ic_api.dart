
import '../dfinity.dart';

abstract class AbstractPlatformICApi {
    void authenticate();
    Future<void> buildServices(BuildContext context);
}