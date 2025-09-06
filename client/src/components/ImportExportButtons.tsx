import React, { useRef } from 'react';
import { Upload, Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ImportExportButtonsProps {
  onImportExcel?: (file: File) => void;
  onImportXML?: (file: File) => void;
  onExportExcel?: () => void;
  onExportXML?: () => void;
  showXML?: boolean;
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
  onImportExcel,
  onImportXML,
  onExportExcel,
  onExportXML,
  showXML = false,
}) => {
  const excelInputRef = useRef<HTMLInputElement>(null);
  const xmlInputRef = useRef<HTMLInputElement>(null);

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImportExcel) {
      onImportExcel(file);
    }
    if (excelInputRef.current) {
      excelInputRef.current.value = '';
    }
  };

  const handleXMLImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImportXML) {
      onImportXML(file);
    }
    if (xmlInputRef.current) {
      xmlInputRef.current.value = '';
    }
  };

  return (
    <div className="flex space-x-2">
      {/* Excel Import */}
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleExcelImport}
        className="hidden"
      />
      <button
        onClick={() => excelInputRef.current?.click()}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import Excel
      </button>

      {/* XML Import (PIM only) */}
      {showXML && (
        <>
          <input
            ref={xmlInputRef}
            type="file"
            accept=".xml"
            onChange={handleXMLImport}
            className="hidden"
          />
          <button
            onClick={() => xmlInputRef.current?.click()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import XML
          </button>
        </>
      )}

      {/* Excel Export */}
      <button
        onClick={onExportExcel}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Download className="h-4 w-4 mr-2" />
        <FileSpreadsheet className="h-4 w-4 mr-1" />
        Export Excel
      </button>

      {/* XML Export (PIM only) */}
      {showXML && (
        <button
          onClick={onExportXML}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-2" />
          <FileText className="h-4 w-4 mr-1" />
          Export XML
        </button>
      )}
    </div>
  );
};

export default ImportExportButtons;