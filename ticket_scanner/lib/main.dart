import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

void main() {
  runApp(const TicketVerifierApp());
}

class TicketVerifierApp extends StatelessWidget {
  const TicketVerifierApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ticket Verifier',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
      home: const LoginScreen(),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final storage = const FlutterSecureStorage();
  bool isLoading = false;
  // Get backend URL from environment or use default
  // For production: https://your-render-url.onrender.com
  // For local development: http://10.0.2.2:8000 (Android emulator) or http://YOUR_IP:8000
  String apiBaseUrl = const String.fromEnvironment(
    'BACKEND_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );

  @override
  void initState() {
    super.initState();
    _checkLogin();
  }

  Future<void> _checkLogin() async {
    final token = await storage.read(key: 'admin_token');
    if (token != null && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => ScannerScreen(apiBaseUrl: apiBaseUrl),
        ),
      );
    }
  }

  Future<void> _login() async {
    if (emailController.text.isEmpty || passwordController.text.isEmpty) {
      _showError('Please enter email and password');
      return;
    }

    setState(() => isLoading = true);

    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/api/admin/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': emailController.text.trim(),
          'password': passwordController.text,
        }),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await storage.write(key: 'admin_token', value: data['access_token']);
        await storage.write(key: 'admin_email', value: emailController.text);

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ScannerScreen(apiBaseUrl: apiBaseUrl),
          ),
        );
      } else {
        final error = json.decode(response.body);
        _showError(error['detail'] ?? 'Login failed');
      }
    } catch (e) {
      _showError('Error connecting to server: $e');
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _showError(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.blue.shade400, Colors.blue.shade900],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Card(
                elevation: 8,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.qr_code_scanner,
                        size: 80,
                        color: Colors.blue,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Ticket Verifier',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Admin Login',
                        style: TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                      const SizedBox(height: 32),
                      TextField(
                        controller: emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: 'Email',
                          prefixIcon: const Icon(Icons.email),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: passwordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onSubmitted: (_) => _login(),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Text(
                                  'Login',
                                  style: TextStyle(fontSize: 18),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }
}

class ScannerScreen extends StatefulWidget {
  final String apiBaseUrl;
  const ScannerScreen({super.key, required this.apiBaseUrl});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController controller = MobileScannerController();
  final TextEditingController manualSerialController = TextEditingController();
  final storage = const FlutterSecureStorage();
  bool isProcessing = false;
  String? adminEmail;

  @override
  void initState() {
    super.initState();
    _loadAdminInfo();
  }

  Future<void> _loadAdminInfo() async {
    adminEmail = await storage.read(key: 'admin_email');
    if (mounted) setState(() {});
  }

  Future<void> _logout() async {
    await storage.delete(key: 'admin_token');
    await storage.delete(key: 'admin_email');
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  void dispose() {
    controller.dispose();
    manualSerialController.dispose();
    super.dispose();
  }

  Future<void> verifyTicket(String serialCode) async {
    if (isProcessing) return;

    setState(() {
      isProcessing = true;
    });

    try {
      final response = await http.get(
        Uri.parse('${widget.apiBaseUrl}/verify-ticket/$serialCode'),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DetailsScreen(
              ticketData: data,
              serialCode: serialCode,
              apiBaseUrl: widget.apiBaseUrl,
            ),
          ),
        ).then((_) {
          setState(() {
            isProcessing = false;
          });
        });
      } else {
        final error = json.decode(response.body);
        _showErrorDialog(error['detail'] ?? 'Ticket verification failed');
        setState(() {
          isProcessing = false;
        });
      }
    } catch (e) {
      _showErrorDialog('Error connecting to server: $e');
      setState(() {
        isProcessing = false;
      });
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showManualEntryDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter Serial Code'),
        content: TextField(
          controller: manualSerialController,
          decoration: const InputDecoration(
            hintText: 'Enter serial code',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              manualSerialController.clear();
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final serial = manualSerialController.text.trim();
              Navigator.pop(context);
              manualSerialController.clear();
              if (serial.isNotEmpty) {
                verifyTicket(serial);
              }
            },
            child: const Text('Verify'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Scan Ticket'),
            if (adminEmail != null)
              Text(adminEmail!, style: const TextStyle(fontSize: 12)),
          ],
        ),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Logout'),
                  content: const Text('Are you sure you want to logout?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _logout();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Logout'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Container(
        color: Colors.black,
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20.0),
                child: Text(
                  'Position QR code inside the square',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 20),
              Center(
                child: Container(
                  width: 280,
                  height: 280,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white, width: 3),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: MobileScanner(
                      controller: controller,
                      onDetect: (capture) {
                        final List<Barcode> barcodes = capture.barcodes;
                        for (final barcode in barcodes) {
                          if (barcode.rawValue != null && !isProcessing) {
                            verifyTicket(barcode.rawValue!);
                            break;
                          }
                        }
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _showManualEntryDialog,
                icon: const Icon(Icons.keyboard, size: 20),
                label: const Text('Enter Serial Manually'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              ElevatedButton.icon(
                onPressed: () => controller.toggleTorch(),
                icon: const Icon(Icons.flash_on, size: 20),
                label: const Text('Toggle Flash'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                ),
              ),
              if (isProcessing)
                const Padding(
                  padding: EdgeInsets.only(top: 20, bottom: 20),
                  child: CircularProgressIndicator(color: Colors.white),
                ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class DetailsScreen extends StatelessWidget {
  final Map<String, dynamic> ticketData;
  final String serialCode;
  final String apiBaseUrl;

  const DetailsScreen({
    super.key,
    required this.ticketData,
    required this.serialCode,
    required this.apiBaseUrl,
  });

  Future<void> markAsUsed(BuildContext context) async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/mark-used/$serialCode'),
      );

      if (!context.mounted) return;

      if (response.statusCode == 200) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Success'),
            content: const Text('Ticket marked as used successfully!'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Go back to scanner
                },
                child: const Text('OK'),
              ),
            ],
          ),
        );
      } else {
        final error = json.decode(response.body);
        _showErrorDialog(
          context,
          error['detail'] ?? 'Failed to mark ticket as used',
        );
      }
    } catch (e) {
      _showErrorDialog(context, 'Error connecting to server: $e');
    }
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isUsed = ticketData['ticket_used'] ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ticket Details'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          isUsed ? Icons.cancel : Icons.check_circle,
                          color: isUsed ? Colors.red : Colors.green,
                          size: 40,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            isUsed ? 'TICKET ALREADY USED' : 'VALID TICKET',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: isUsed ? Colors.red : Colors.green,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 30),
                    _buildDetailRow('Serial Code', serialCode),
                    _buildDetailRow('Name', ticketData['full_name'] ?? 'N/A'),
                    _buildDetailRow('Email', ticketData['email'] ?? 'N/A'),
                    _buildDetailRow(
                      'Phone',
                      ticketData['phone_number'] ?? 'N/A',
                    ),
                    _buildDetailRow(
                      'Organization',
                      ticketData['organization'] ?? 'N/A',
                    ),
                    _buildDetailRow(
                      'Registered At',
                      ticketData['registered_at'] ?? 'N/A',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            if (!isUsed)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => markAsUsed(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Continue', style: TextStyle(fontSize: 18)),
                ),
              ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Go Back', style: TextStyle(fontSize: 18)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 16))),
        ],
      ),
    );
  }
}
