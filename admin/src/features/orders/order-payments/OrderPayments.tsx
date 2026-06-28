import { useState } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { MdReceiptLong } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import moment from 'moment';
import CommonModal from '../../../components/ui/modal/CommonModal';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import SelectAndSearch from '../../../components/ui/SelectAndSearch';
import InputNumber from '../../../components/ui/InputNumber';
import InputString from '../../../components/ui/InputString';
import { useGetAllAccountsQuery } from '../../accounting/accounts/accountApi';
import {
  useLazyGetPaymentsByInvoiceQuery,
  useCreateOrderPaymentMutation,
  useDeleteOrderPaymentMutation,
} from './orderPaymentApi';

const paymentMethodOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Cash on Delivery (COD)', value: 'cash_on_delivery' },
  { label: 'SSL Commerce (Online)', value: 'ssl_commerce' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'bKash', value: 'bkash' },
  { label: 'Nagad', value: 'nagad' },
  { label: 'Rocket', value: 'rocket' },
  { label: 'Card', value: 'card' },
  { label: 'Other', value: 'other' },
];

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  unpaid: 'bg-red-100 text-red-800',
};

const CollectPaymentForm = ({ orderId, onClose }: { orderId: string; onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { paidAt: moment().format('YYYY-MM-DD') },
  });

  const [createPayment, { isLoading }] = useCreateOrderPaymentMutation();
  const { data: accountData } = useGetAllAccountsQuery({ limit: 100 });

  const accountOptions =
    accountData?.data?.data?.data?.map((a: any) => ({
      label: `${a.account_name} (৳${Number(a.current_balance).toLocaleString()})`,
      value: a.id,
    })) || [];

  const onSubmit = async (data: any) => {
    try {
      const result = await createPayment({
        orderId,
        amount: Number(data.amount),
        accountId: data.accountId || undefined,
        paymentMethod: data.paymentMethod || undefined,
        paidAt: data.paidAt,
        note: data.note || undefined,
      }).unwrap();

      if (result?.success) {
        toast.success('Payment recorded successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to record payment');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to record payment. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputNumber
        name="amount"
        label="Amount"
        placeholder="Enter amount"
        register={register}
        errors={errors}
        symble="৳"
        required
      />

      <SelectAndSearch
        name="accountId"
        label="Deposit to Account (Optional)"
        placeholder="Select account"
        options={accountOptions}
        register={register}
        setValue={setValue}
        clearErrors={clearErrors}
        trigger={trigger}
        errors={errors}
        required={false}
        onChange={() => {}}
      />

      <SelectAndSearch
        name="paymentMethod"
        label="Payment Method (Optional)"
        placeholder="Select method"
        options={paymentMethodOptions}
        register={register}
        setValue={setValue}
        clearErrors={clearErrors}
        trigger={trigger}
        errors={errors}
        required={false}
        onChange={() => {}}
      />

      <InputString
        name="paidAt"
        label="Payment Date"
        type="date"
        register={register}
        errors={errors}
        required
      />

      <InputString
        name="note"
        label="Note (Optional)"
        placeholder="e.g. Advance payment, partial, etc."
        register={register}
        errors={errors}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-2.5 cursor-pointer bg-primary-500 text-white rounded-md hover:bg-primary-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Saving...
          </>
        ) : (
          <>
            <FiPlus />
            Record Payment
          </>
        )}
      </button>
    </form>
  );
};

const OrderPayments = () => {
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [showCollectModal, setShowCollectModal] = useState(false);

  const [fetchByInvoice, { data: invoiceResult, isFetching, error }] =
    useLazyGetPaymentsByInvoiceQuery();

  const [deletePayment, { isLoading: isDeleting }] = useDeleteOrderPaymentMutation();

  const ledgerData = invoiceResult?.data;
  const order = ledgerData?.order;
  const payments: any[] = ledgerData?.payments || [];
  const totalPaid: number = Number(ledgerData?.totalPaid || 0);
  const due: number = Number(ledgerData?.due || 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = invoiceSearch.trim();
    if (!trimmed) return;
    fetchByInvoice(trimmed);
  };

  const handleDelete = async (payment: any) => {
    try {
      const result = await deletePayment(payment.id).unwrap();
      if (result?.success !== false) {
        toast.success('Payment deleted and balance restored.');
        if (invoiceSearch.trim()) fetchByInvoice(invoiceSearch.trim());
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete payment.');
    }
  };

  const handleCollectClose = () => {
    setShowCollectModal(false);
    if (invoiceSearch.trim()) fetchByInvoice(invoiceSearch.trim());
  };

  // Running balance computation
  let runningBalance = 0;
  const paymentsWithBalance = payments.map((p) => {
    runningBalance += Number(p.amount);
    return { ...p, runningBalance };
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Payment Ledger</h1>
          <p className="text-gray-600 mt-1">Search by invoice number and collect payments</p>
        </div>
        {order && (
          <button
            onClick={() => setShowCollectModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus />
            Collect Payment
          </button>
        )}
      </div>

      {/* Invoice Search */}
      <div className="mt-6">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter invoice / order number..."
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={isFetching || !invoiceSearch.trim()}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isFetching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && !isFetching && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Order not found. Please check the invoice number and try again.
        </div>
      )}

      {/* Order found */}
      {order && !isFetching && (
        <div className="mt-6 space-y-5">
          {/* Order Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 rounded-lg">
                  <MdReceiptLong className="text-primary-500 text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice</p>
                  <p className="font-bold text-gray-800 text-lg">{order.orderNumber}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium text-gray-700">{order.address?.fullName || '—'}</p>
                  <p className="text-xs text-gray-400">{order.address?.phone || ''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Status</p>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {order.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      statusColors[order.paymentStatus] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Order</p>
              <p className="text-2xl font-bold text-gray-800">
                ৳ {Number(order.totalPrice).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-700">৳ {totalPaid.toLocaleString()}</p>
            </div>
            <div
              className={`rounded-xl border p-4 ${
                due === 0 ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <p
                className={`text-xs uppercase tracking-wide mb-1 ${
                  due === 0 ? 'text-gray-500' : 'text-red-600'
                }`}
              >
                Due Amount
              </p>
              <p className={`text-2xl font-bold ${due === 0 ? 'text-gray-600' : 'text-red-700'}`}>
                ৳ {due.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Ledger Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Payment History</h2>
              <span className="text-sm text-gray-500">{payments.length} payment(s)</span>
            </div>

            {payments.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <MdReceiptLong className="mx-auto text-4xl mb-2 opacity-30" />
                <p>No payments recorded yet</p>
                <button
                  onClick={() => setShowCollectModal(true)}
                  className="mt-3 text-primary-500 hover:underline text-sm"
                >
                  Collect First Payment
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        #
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Date
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Amount
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Running Total
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Account
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Method
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Note
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        By
                      </th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paymentsWithBalance.map((p, index) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-gray-500">{index + 1}</td>
                        <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                          {moment(p.paidAt).format('DD MMM YYYY')}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-green-600 whitespace-nowrap">
                          + ৳ {Number(p.amount).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium text-gray-700 whitespace-nowrap">
                          ৳ {Number(p.runningBalance).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {p.account?.account_name || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          {p.paymentMethod ? (
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs capitalize">
                              {p.paymentMethod.replace('_', ' ')}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 max-w-[160px] truncate">
                          {p.note || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                          {p.createdBy?.name || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <DeleteAction
                            handleDelete={() => handleDelete(p)}
                            item={p}
                            disabled={isDeleting}
                            itemName={`payment of ৳${Number(p.amount).toLocaleString()}`}
                            tooltip="Delete payment (balance will be restored)"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                      <td
                        colSpan={2}
                        className="px-5 py-3 text-gray-700 uppercase text-xs tracking-wide"
                      >
                        Total
                      </td>
                      <td className="px-5 py-3 text-right text-green-700">
                        ৳ {totalPaid.toLocaleString()}
                      </td>
                      <td colSpan={6} className="px-5 py-3 text-right">
                        <span
                          className={`text-sm font-semibold ${
                            due === 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {due === 0 ? '✓ Fully Paid' : `Due: ৳ ${due.toLocaleString()}`}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      <CommonModal
        isOpen={showCollectModal}
        onClose={() => setShowCollectModal(false)}
        title="Collect Payment"
      >
        {order && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            <span className="text-gray-500">Invoice:</span>{' '}
            <span className="font-semibold">{order.orderNumber}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-500">Due:</span>{' '}
            <span className={`font-semibold ${due > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ৳ {due.toLocaleString()}
            </span>
          </div>
        )}
        {order && <CollectPaymentForm orderId={order.id} onClose={handleCollectClose} />}
      </CommonModal>
    </div>
  );
};

export default OrderPayments;
