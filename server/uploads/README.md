# Uploads Directory

This directory stores uploaded files from the content management system.

## Important Notes

- **DO NOT commit uploaded files to git** - They are excluded via `.gitignore`
- Files can be large and will cause git repository size issues
- The `.gitkeep` file ensures this directory exists in the repository
- Uploaded files should be managed separately (backups, cloud storage, etc.)

## File Storage

- Uploaded files are stored here temporarily
- Consider implementing cloud storage (S3, Azure Blob, etc.) for production
- Files are accessible via `/uploads/` endpoint

## Backup Strategy

For production environments, implement:
1. Regular backups of this directory
2. Cloud storage integration
3. File cleanup policies for old/unused files

