import express from 'express';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const router = express.Router();

router.get('/zip-contents', (req, res) => {
  const extractedPath = path.join(process.cwd().replace('\\server', ''), 'extracted_databases');
  const vcdbZip = path.join(extractedPath, 'VCdb', 'AutoCare_VCdb_GLOBAL_enUS_MySQL_20231026.zip');
  
  try {
    if (!fs.existsSync(vcdbZip)) {
      return res.json({ error: 'ZIP not found', path: vcdbZip });
    }

    const zip = new AdmZip(vcdbZip);
    const entries = zip.getEntries();
    
    const fileInfo = entries.map(entry => ({
      name: entry.entryName,
      size: entry.header.size,
      isDirectory: entry.isDirectory
    }));

    // Get first few lines of largest SQL file
    const sqlEntry = entries.filter(e => e.entryName.endsWith('.sql'))
      .reduce((largest, current) => current.header.size > largest.header.size ? current : largest);

    let preview = '';
    if (sqlEntry) {
      const content = sqlEntry.getData().toString('utf8');
      preview = content.substring(0, 2000);
    }

    res.json({
      zipPath: vcdbZip,
      files: fileInfo,
      largestSql: sqlEntry?.entryName,
      preview
    });

  } catch (error) {
    res.json({ error: error.message });
  }
});

export default router;