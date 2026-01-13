// Admin Recovery Page - Recover stuck pending registrations
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2, Search, RefreshCw, FileText, ExternalLink } from 'lucide-react';

interface RecoveryResult {
  summary: {
    total_pending: number;
    checked: number;
    successful_payments_count: number;
    failed_payments_count: number;
    already_completed_count: number;
    processed_count: number;
    errors_count: number;
  };
  results: {
    successful_payments: any[];
    failed_payments: any[];
    already_completed: any[];
    processed: any[];
    errors: any[];
  };
}

export default function RecoveryPage() {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<RecoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [merchantOrderId, setMerchantOrderId] = useState('');

  const scanPending = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/recover-pending?action=scan');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan pending registrations');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const processAll = async () => {
    if (!confirm('Are you sure you want to process all successful pending payments? This will create member and registration records for all stuck payments.')) {
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/recover-pending?action=scan&auto_process=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process pending registrations');
      }

      setResult(data);
      alert(`Successfully processed ${data.summary.processed_count} registrations!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setProcessing(false);
    }
  };

  const processSingle = async () => {
    if (!transactionId.trim()) {
      alert('Please enter a transaction ID');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/recover-pending?transaction_id=${transactionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process registration');
      }

      alert(`Successfully processed registration!\nMember ID: ${data.member_id}\nRegistration ID: ${data.registration_id}`);
      setTransactionId('');
      
      // Refresh the scan
      await scanPending();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-orange-600" />
                Registration Recovery
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Find and recover stuck pending registrations with successful payments
              </p>
            </div>
            <Button
              onClick={scanPending}
              disabled={loading || processing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Scan Pending
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Payment Callback Trigger */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            Trigger Payment Callback
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Manually trigger the payment callback flow (simulates PhonePe redirect)
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter merchant order ID (e.g., YC26_1234567890_123)"
              value={merchantOrderId}
              onChange={(e) => setMerchantOrderId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              onClick={() => {
                if (!merchantOrderId.trim()) {
                  alert('Please enter a merchant order ID');
                  return;
                }
                const callbackUrl = `https://www.yescateam.com/register/payment-callback?from=phonepe&merchantOrderId=${merchantOrderId}`;
                window.open(callbackUrl, '_blank');
              }}
              disabled={!merchantOrderId.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Callback
            </Button>
          </div>
        </div>

        {/* Process Single Transaction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Process Single Transaction</h2>
          <p className="text-sm text-gray-600 mb-4">
            Recover a stuck payment by processing it directly
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter transaction ID (e.g., YC26_1234567890_123)"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <Button
              onClick={processSingle}
              disabled={!transactionId.trim() || processing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process'
              )}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-xs text-gray-500 uppercase mb-1">Total Pending</div>
                <div className="text-2xl font-bold text-gray-900">{result.summary.total_pending}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-xs text-gray-500 uppercase mb-1">Checked</div>
                <div className="text-2xl font-bold text-blue-600">{result.summary.checked}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 bg-red-50">
                <div className="text-xs text-red-600 uppercase mb-1">Stuck (Success)</div>
                <div className="text-2xl font-bold text-red-600">{result.summary.successful_payments_count}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-xs text-gray-500 uppercase mb-1">Failed Payments</div>
                <div className="text-2xl font-bold text-gray-600">{result.summary.failed_payments_count}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 bg-green-50">
                <div className="text-xs text-green-600 uppercase mb-1">Completed</div>
                <div className="text-2xl font-bold text-green-600">{result.summary.already_completed_count}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-emerald-200 p-4 bg-emerald-50">
                <div className="text-xs text-emerald-600 uppercase mb-1">Processed Now</div>
                <div className="text-2xl font-bold text-emerald-600">{result.summary.processed_count}</div>
              </div>
            </div>

            {/* Process All Button */}
            {result.summary.successful_payments_count > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {result.summary.successful_payments_count} Stuck Registration{result.summary.successful_payments_count !== 1 ? 's' : ''} Found!
                    </h3>
                    <p className="text-sm text-orange-700 mt-1">
                      These payments were successful but registrations were not completed. Click below to process them all.
                    </p>
                  </div>
                  <Button
                    onClick={processAll}
                    disabled={processing}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Process All ({result.summary.successful_payments_count})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Stuck Payments Table */}
            {result.results.successful_payments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                  <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Stuck Successful Payments ({result.results.successful_payments.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {result.results.successful_payments.map((payment) => (
                        <tr key={payment.transaction_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">{payment.transaction_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{payment.full_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{payment.phone_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">₹{payment.amount}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-lg bg-purple-100 text-purple-700">
                              {payment.registration_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Processed Table */}
            {result.results.processed.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-emerald-200 overflow-hidden">
                <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200">
                  <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Successfully Processed ({result.results.processed.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {result.results.processed.map((item) => (
                        <tr key={item.transaction_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">{item.transaction_id}</td>
                          <td className="px-6 py-4 text-sm font-mono font-bold text-emerald-600">{item.member_id}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">{item.registration_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.full_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.phone_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">₹{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Errors Table */}
            {result.results.errors.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
                <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                  <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Errors ({result.results.errors.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {result.results.errors.map((error, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">{error.transaction_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{error.phone_number}</td>
                          <td className="px-6 py-4 text-sm text-red-600">{error.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Export JSON */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Raw Data
              </h2>
              <Button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `recovery-results-${new Date().toISOString()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                variant="outline"
              >
                Download JSON
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
