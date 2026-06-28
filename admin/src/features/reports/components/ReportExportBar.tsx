import { FaFileExcel, FaFilePdf } from 'react-icons/fa';

interface Props {
  onExcelExport: () => void;
  onPdfExport: () => void;
  disabled?: boolean;
  rowCount?: number;
}

export default function ReportExportBar({ onExcelExport, onPdfExport, disabled, rowCount }: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      {rowCount !== undefined && (
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">{rowCount}</span> record
          {rowCount !== 1 ? 's' : ''} found
        </p>
      )}
      <div className="flex gap-2 ml-auto">
        <button
          onClick={onExcelExport}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFileExcel className="text-base" />
          Export Excel
        </button>
        <button
          onClick={onPdfExport}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFilePdf className="text-base" />
          Export PDF
        </button>
      </div>
    </div>
  );
}
