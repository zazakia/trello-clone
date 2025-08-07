import { useState, useEffect } from 'react';
import { checkNotesMigration, getMigrationInstructions, type MigrationStatus } from '../utils/migration-check';

export function useNotesHealth() {
  const [isHealthy, setIsHealthy] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkNotesHealth();
  }, []);

  const checkNotesHealth = async () => {
    try {
      setLoading(true);
      const status = await checkNotesMigration();
      setMigrationStatus(status);
      setIsHealthy(status.isComplete);
    } catch (err) {
      setMigrationStatus({
        isComplete: false,
        missingTables: [],
        errors: [err instanceof Error ? err.message : 'Unknown error']
      });
      setIsHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (): string => {
    if (!migrationStatus) return 'Unknown error';
    
    if (migrationStatus.missingTables.length > 0) {
      return `Missing database tables: ${migrationStatus.missingTables.join(', ')}`;
    }
    
    if (migrationStatus.errors.length > 0) {
      return migrationStatus.errors.join('; ');
    }
    
    return 'Notes system is not properly configured';
  };

  return { 
    isHealthy, 
    error: isHealthy ? null : getErrorMessage(),
    migrationStatus,
    instructions: getMigrationInstructions(),
    loading, 
    retry: checkNotesHealth 
  };
}