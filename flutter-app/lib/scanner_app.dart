import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class TicketVerifierApp extends StatelessWidget {
  const TicketVerifierApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Event Ticket Verifier',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const ScannerScreen(),
    );
  }
}

// Scanner Screen - Main screen with QR scanner and manual input
class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController _cameraController = MobileScannerController();
  final TextEditingController _serialController = TextEditingController();

  // IMPORTANT: Change this to your backend URL
  // For Android emulator: http://10.0.2.2:8000
  // For iOS simulator: http://localhost:8000
  // For physical device: http://YOUR_COMPUTER_IP:8000
  final String apiBaseUrl = 'http://10.0.2.2:8000';

  bool _isScanning = false;

  @override
  void dispose() {
    _cameraController.dispose();
    _serialController.dispose();
    super.dispose();
  }

  // Verify ticket with backend API
  Future<void> _verifyTicket(String serialNumber) async {
    if (_isScanning) return;

    setState(() {
      _isScanning = true;
    });

    try {
      final response = await http.get(
        Uri.parse('$apiBaseUrl/verify-ticket/$serialNumber'),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Navigate to details screen with participant data
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DetailsScreen(
              participantData: data,
              serialNumber: serialNumber,
              apiBaseUrl: apiBaseUrl,
            ),
          ),
        ).then((_) {
          // Reset after returning from details screen
          setState(() {
            _isScanning = false;
          });
        });
      } else {
        _showError('Invalid ticket or ticket not found');
        setState(() {
          _isScanning = false;
        });
      }
    } catch (e) {
      if (mounted) {
        _showError('Error verifying ticket: $e');
        setState(() {
          _isScanning = false;
        });
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Event Ticket Scanner'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: Column(
        children: [
          // QR Scanner Area
          Expanded(
            flex: 3,
            child: Stack(
              children: [
                MobileScanner(
                  controller: _cameraController,
                  onDetect: (capture) {
                    if (_isScanning) return;

                    final List<Barcode> barcodes = capture.barcodes;
                    for (final barcode in barcodes) {
                      if (barcode.rawValue != null) {
                        _verifyTicket(barcode.rawValue!);
                        break;
                      }
                    }
                  },
                ),
                // Scanning overlay
                if (_isScanning)
                  Container(
                    color: Colors.black54,
                    child: const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: Colors.white),
                          SizedBox(height: 16),
                          Text(
                            'Verifying ticket...',
                            style: TextStyle(color: Colors.white, fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                  ),
                // Instructions
                if (!_isScanning)
                  Positioned(
                    bottom: 20,
                    left: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      margin: const EdgeInsets.symmetric(horizontal: 40),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Scan QR Code',
                        style: TextStyle(color: Colors.white, fontSize: 16),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Manual Input Section
          Expanded(
            flex: 1,
            child: Container(
              padding: const EdgeInsets.all(16),
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Manual Entry (if QR fails)',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _serialController,
                          decoration: InputDecoration(
                            hintText: 'Enter Serial Code',
                            prefixIcon: const Icon(Icons.confirmation_number),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            filled: true,
                          ),
                          textCapitalization: TextCapitalization.characters,
                        ),
                      ),
                      const SizedBox(width: 8),
                      FilledButton.icon(
                        onPressed: _isScanning
                            ? null
                            : () {
                                if (_serialController.text.isNotEmpty) {
                                  _verifyTicket(_serialController.text.trim());
                                }
                              },
                        icon: const Icon(Icons.check),
                        label: const Text('Verify'),
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 16,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Details Screen - Shows participant details after successful scan
class DetailsScreen extends StatelessWidget {
  final Map<String, dynamic> participantData;
  final String serialNumber;
  final String apiBaseUrl;

  const DetailsScreen({
    super.key,
    required this.participantData,
    required this.serialNumber,
    required this.apiBaseUrl,
  });

  Future<void> _markAsUsed(BuildContext context) async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/mark-used/$serialNumber'),
      );

      if (!context.mounted) return;

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ticket marked as used successfully'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      } else {
        throw Exception('Failed to mark ticket');
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = participantData['status']?.toString() ?? 'unknown';
    final isApproved = status.toLowerCase() == 'approved';
    final isUsed = status.toLowerCase() == 'used';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Participant Details'),
        backgroundColor: isApproved && !isUsed
            ? Colors.green.shade700
            : Colors.orange.shade700,
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // Status Icon
                  Icon(
                    isApproved && !isUsed ? Icons.check_circle : Icons.info,
                    size: 80,
                    color: isApproved && !isUsed ? Colors.green : Colors.orange,
                  ),
                  const SizedBox(height: 16),

                  // Status Text
                  Text(
                    isUsed
                        ? 'Ticket Already Used'
                        : isApproved
                        ? 'Valid Ticket ✓'
                        : 'Pending Approval',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: isApproved && !isUsed
                          ? Colors.green
                          : Colors.orange,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Participant Details Card
                  Card(
                    elevation: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Participant Information',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Divider(height: 24),
                          _buildInfoRow(
                            'Name',
                            participantData['name'] ?? 'N/A',
                          ),
                          _buildInfoRow(
                            'Email',
                            participantData['email'] ?? 'N/A',
                          ),
                          _buildInfoRow(
                            'Phone',
                            participantData['phone'] ?? 'N/A',
                          ),
                          if (participantData['team_name'] != null)
                            _buildInfoRow('Team', participantData['team_name']),
                          if (participantData['event_name'] != null)
                            _buildInfoRow(
                              'Event',
                              participantData['event_name'],
                            ),
                          _buildInfoRow('Serial', serialNumber),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: isApproved && !isUsed
                                  ? Colors.green
                                  : Colors.orange,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              status.toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Action Buttons
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isApproved && !isUsed)
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: () => _markAsUsed(context),
                      icon: const Icon(Icons.check_circle),
                      label: const Text(
                        'Continue (Mark as Used)',
                        style: TextStyle(fontSize: 16),
                      ),
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.green,
                        padding: const EdgeInsets.all(16),
                      ),
                    ),
                  ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back),
                    label: const Text(
                      'Back to Scanner',
                      style: TextStyle(fontSize: 16),
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 16))),
        ],
      ),
    );
  }
}
