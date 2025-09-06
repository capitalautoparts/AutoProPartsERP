export interface ImportJob {
  id: string;
  type: 'excel' | 'xml';
  module: 'products' | 'customers' | 'orders';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;
  s3Key: string;
  recordsProcessed?: number;
  totalRecords?: number;
  errors?: string[];
  warnings?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportJob {
  id: string;
  type: 'excel' | 'xml';
  module: 'products' | 'customers' | 'orders';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;
  s3Key?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}