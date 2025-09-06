import { v4 as uuidv4 } from 'uuid';
import { ImportJob, ExportJob } from '../types/job.js';

class JobService {
  private importJobs: ImportJob[] = [];
  private exportJobs: ExportJob[] = [];

  createImportJob(type: 'excel' | 'xml', module: string, fileName: string, s3Key: string): ImportJob {
    const job: ImportJob = {
      id: uuidv4(),
      type,
      module: module as any,
      status: 'pending',
      fileName,
      s3Key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.importJobs.push(job);
    
    // Simulate async processing
    setTimeout(() => this.processImportJob(job.id), 2000);
    
    return job;
  }

  createExportJob(type: 'excel' | 'xml', module: string): ExportJob {
    const job: ExportJob = {
      id: uuidv4(),
      type,
      module: module as any,
      status: 'pending',
      fileName: `${module}_export_${Date.now()}.${type === 'excel' ? 'xlsx' : 'xml'}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.exportJobs.push(job);
    
    // Simulate async processing
    setTimeout(() => this.processExportJob(job.id), 1500);
    
    return job;
  }

  private processImportJob(jobId: string) {
    const job = this.importJobs.find(j => j.id === jobId);
    if (!job) return;

    job.status = 'processing';
    job.updatedAt = new Date().toISOString();

    // Simulate processing time
    setTimeout(() => {
      job.status = 'completed';
      job.recordsProcessed = Math.floor(Math.random() * 1000) + 100;
      job.totalRecords = job.recordsProcessed + Math.floor(Math.random() * 10);
      job.updatedAt = new Date().toISOString();
    }, 3000);
  }

  private processExportJob(jobId: string) {
    const job = this.exportJobs.find(j => j.id === jobId);
    if (!job) return;

    job.status = 'processing';
    job.updatedAt = new Date().toISOString();

    // Simulate processing time
    setTimeout(() => {
      job.status = 'completed';
      job.s3Key = `exports/${job.fileName}`;
      job.downloadUrl = `https://s3.amazonaws.com/bucket/${job.s3Key}`;
      job.updatedAt = new Date().toISOString();
    }, 2500);
  }

  getImportJob(id: string): ImportJob | undefined {
    return this.importJobs.find(j => j.id === id);
  }

  getExportJob(id: string): ExportJob | undefined {
    return this.exportJobs.find(j => j.id === id);
  }

  getAllImportJobs(): ImportJob[] {
    return this.importJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllExportJobs(): ExportJob[] {
    return this.exportJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const jobService = new JobService();