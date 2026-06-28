import { useState } from 'react';
import moment from 'moment';
import { useGetMessageHistoryQuery } from './messagingApi';
import { EmptyState } from '../../components/ui/status/EmptyState';
import { ErrorState } from '../../components/ui/status/ErrorState';
import CommonModal from '../../components/ui/modal/CommonModal';

const STATUS_BADGE: Record<string, string> = {
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  partial: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-600',
};

const CHANNEL_BADGE: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  sms: 'bg-green-100 text-green-700',
};

const MessageHistory = () => {
  const [page, setPage] = useState(1);
  const [viewLog, setViewLog] = useState<any>(null);
  const limit = 20;

  const { data, error, isFetching, refetch } = useGetMessageHistoryQuery({ page, limit });
  const historyResult = data?.data;
  const logs: any[] = historyResult?.data || [];
  const total: number = historyResult?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Message History</h1>
          <p className="text-gray-500 mt-1">Track all sent messages and their delivery status</p>
        </div>
      </div>

      <div className="table-container mt-8">
        {error ? (
          <ErrorState message={(error as any)?.data?.message || 'Failed to fetch history'} refetch={refetch} />
        ) : logs.length === 0 && !isFetching ? (
          <EmptyState message="No messages sent yet" />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            <table className="table w-full">
              <thead>
                <tr className="table-row">
                  <th>#</th>
                  <th>CHANNEL</th>
                  <th>TARGET</th>
                  <th>SUBJECT</th>
                  <th>SENT</th>
                  <th>FAILED</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th className="text-center!">DETAILS</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {logs.map((log: any, i: number) => (
                  <tr key={log.id}>
                    <td>{(page - 1) * limit + i + 1}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${CHANNEL_BADGE[log.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="capitalize text-sm text-gray-600">{log.recipientType}</td>
                    <td className="text-sm text-gray-500 max-w-[160px] truncate">
                      {log.subject || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-green-600 font-medium">{log.totalSent}</td>
                    <td className="text-red-500 font-medium">{log.totalFailed}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[log.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">{moment(log.createdAt).format('DD MMM YYYY HH:mm')}</td>
                    <td className="text-center">
                      <button
                        onClick={() => setViewLog(log)}
                        className="text-xs text-primary-500 hover:underline font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      p === page ? 'bg-primary-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Log detail modal */}
      <CommonModal isOpen={!!viewLog} onClose={() => setViewLog(null)} title="Message Details">
        {viewLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400 block text-xs">Channel</span><span className="font-medium capitalize">{viewLog.channel}</span></div>
              <div><span className="text-gray-400 block text-xs">Target</span><span className="font-medium capitalize">{viewLog.recipientType}</span></div>
              <div><span className="text-gray-400 block text-xs">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[viewLog.status]}`}>{viewLog.status}</span></div>
              <div><span className="text-gray-400 block text-xs">Sent / Failed</span><span className="font-medium text-green-600">{viewLog.totalSent}</span><span className="text-gray-400 mx-1">/</span><span className="font-medium text-red-500">{viewLog.totalFailed}</span></div>
              {viewLog.subject && <div className="col-span-2"><span className="text-gray-400 block text-xs">Subject</span><span className="font-medium">{viewLog.subject}</span></div>}
            </div>

            <div>
              <span className="text-xs text-gray-400 block mb-1">Message Body</span>
              <pre className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto border">{viewLog.body}</pre>
            </div>

            {viewLog.recipients?.length > 0 && (
              <div>
                <span className="text-xs text-gray-400 block mb-1">Recipients ({viewLog.recipients.length})</span>
                <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                  {viewLog.recipients.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                      <span className="text-gray-700">{r.name || r.email || r.phone}</span>
                      <span className={`px-1.5 py-0.5 rounded-full font-medium ${r.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CommonModal>
    </div>
  );
};

export default MessageHistory;
