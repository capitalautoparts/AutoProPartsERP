import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class ZipExtractor {
  static async extractSampleDatabases() {
    const rootPath = process.cwd().replace('\\server', '');
    const referencePath = path.join(rootPath, 'Autocarereference');
    const extractPath = path.join(rootPath, 'extracted_databases');

    // Create extraction directory
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    const databases = [
      { name: 'VCdb', path: path.join(referencePath, 'VCdb_1_0_Documentation', 'VCdb_1_0_SampleDatabases.zip') },
      { name: 'PCdb', path: path.join(referencePath, 'PCdb_1_0_Documentation', 'PCdb_1_0_SampleDatabases.zip') },
      { name: 'PAdb', path: path.join(referencePath, 'PAdb_4_0_Documentation', 'PADB_4_0_SampleDatabases.zip') },
      { name: 'Qdb', path: path.join(referencePath, 'Qdb_1_0_Documentation', 'Qdb_1_0_SampleDatabases.zip') }
    ];

    for (const db of databases) {
      if (fs.existsSync(db.path)) {
        const dbExtractPath = path.join(extractPath, db.name);
        
        try {
          // Use PowerShell to extract ZIP files on Windows
          const command = `powershell -command "Expand-Archive -Path '${db.path}' -DestinationPath '${dbExtractPath}' -Force"`;
          execSync(command, { stdio: 'inherit' });
          console.log(`✅ Extracted ${db.name} to ${dbExtractPath}`);
          
          // List extracted contents
          if (fs.existsSync(dbExtractPath)) {
            const contents = fs.readdirSync(dbExtractPath, { recursive: true });
            console.log(`📂 ${db.name} contents:`, contents.slice(0, 10)); // Show first 10 files
          }
        } catch (error) {
          console.error(`❌ Failed to extract ${db.name}:`, error);
        }
      }
    }

    return extractPath;
  }
}