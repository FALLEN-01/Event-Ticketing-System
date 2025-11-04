import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

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
      home: const ScannerScreen(),
    );
  }
}

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController controller = MobileScannerController();
  final TextEditingController manualSerialController = TextEditingController();
  bool isProcessing = false;
  String apiBaseUrl =
      'http://10.0.2.2:8000'; // Change to your computer's IP for physical device

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
        Uri.parse('$apiBaseUrl/verify-ticket/$serialCode'),
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
              apiBaseUrl: apiBaseUrl,
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
        title: const Text('Scan Ticket'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Container(
        color: Colors.black,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Padding(
              padding: EdgeInsets.all(20.0),
              child: Text(
                'Position QR code inside the square',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            Center(
              child: Container(
                width: 300,
                height: 300,
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
            const SizedBox(height: 30),
            ElevatedButton.icon(
              onPressed: _showManualEntryDialog,
              icon: const Icon(Icons.keyboard),
              label: const Text('Enter Serial Manually'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              onPressed: () => controller.toggleTorch(),
              icon: const Icon(Icons.flash_on),
              label: const Text('Toggle Flash'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
            ),
            if (isProcessing)
              const Padding(
                padding: EdgeInsets.only(top: 20),
                child: CircularProgressIndicator(color: Colors.white),
              ),
          ],
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
