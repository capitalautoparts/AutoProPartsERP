import express from 'express';
import { jobService } from '../services/jobService.js';

const router = express.Router();

// Get all import jobs
router.get('/imports', (req, res) => {
  const jobs = jobService.getAllImportJobs();
  res.json(jobs);
});

// Get all export jobs
router.get('/exports', (req, res) => {
  const jobs = jobService.getAllExportJobs();
  res.json(jobs);
});

// Get specific import job
router.get('/imports/:id', (req, res) => {
  const job = jobService.getImportJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Import job not found' });
  }
  res.json(job);
});

// Get specific export job
router.get('/exports/:id', (req, res) => {
  const job = jobService.getExportJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Export job not found' });
  }
  res.json(job);
});

export default router;