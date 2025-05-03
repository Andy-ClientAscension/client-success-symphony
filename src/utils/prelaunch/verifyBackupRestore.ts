
/**
 * Utility to verify backup and restore procedures
 */

import { 
  createBackup, 
  restoreFromBackup, 
  loadData, 
  saveData, 
  STORAGE_KEYS 
} from "@/utils/persistence";

interface BackupVerificationResult {
  feature: string;
  isConfigured: boolean;
  lastBackup: string | null;
  issues: string[];
}

/**
 * Verify that backup and restore procedures are working correctly
 */
export async function verifyBackupRestore(): Promise<BackupVerificationResult[]> {
  const results: BackupVerificationResult[] = [];
  
  // Check if backup history exists
  const backupHistory = loadData<{timestamp: string, size: number}[]>(
    STORAGE_KEYS.BACKUP_DATA, 
    []
  );
  
  const lastBackupDate = backupHistory.length > 0 
    ? new Date(backupHistory[backupHistory.length - 1].timestamp).toLocaleString() 
    : null;
  
  // Check automated backup configuration
  const automatedBackup = {
    feature: "Automated Backups",
    isConfigured: backupHistory.length > 0,
    lastBackup: lastBackupDate,
    issues: backupHistory.length === 0 ? ["No automated backups configured"] : []
  };
  
  // Check manual backup feature
  const manualBackup = {
    feature: "Manual Backup",
    isConfigured: true,
    lastBackup: lastBackupDate,
    issues: []
  };
  
  // Test restore functionality
  const restoreTest = await testBackupRestore();
  
  results.push(
    automatedBackup,
    manualBackup,
    {
      feature: "Restore Functionality",
      isConfigured: restoreTest.success,
      lastBackup: null,
      issues: restoreTest.issues
    }
  );
  
  return results;
}

/**
 * Test backup and restore by creating a test backup and trying to restore it
 */
async function testBackupRestore(): Promise<{success: boolean; issues: string[]}> {
  const testKey = "backup_test_data";
  const testData = { test: `test_${Date.now()}` };
  
  try {
    // Save test data
    saveData(testKey, testData);
    
    // Create backup
    const backupData = createBackup();
    
    // Clear test data
    localStorage.removeItem(testKey);
    
    // Restore from backup
    const restored = restoreFromBackup(backupData);
    
    // Check if test data was restored
    const restoredData = loadData(testKey, null);
    
    if (!restored || !restoredData) {
      return {
        success: false,
        issues: ["Restore failed - backup data couldn't be recovered"]
      };
    }
    
    // Clean up test data
    localStorage.removeItem(testKey);
    
    return {
      success: true,
      issues: []
    };
  } catch (error) {
    return {
      success: false,
      issues: [error instanceof Error ? error.message : "Unknown error during backup/restore test"]
    };
  }
}

/**
 * Create a full backup for the current user
 */
export function createFullBackup(): string {
  try {
    const backup = createBackup();
    
    // In a real implementation, this might:
    // 1. Store backup in cloud storage
    // 2. Send notification to admin
    // 3. Update backup history
    
    return backup;
  } catch (error) {
    console.error("Backup creation failed:", error);
    throw new Error("Failed to create backup");
  }
}

/**
 * Validate backup data integrity
 */
export function validateBackupIntegrity(backupData: string): {
  isValid: boolean;
  issues: string[];
} {
  try {
    // Parse the backup data
    const backup = JSON.parse(backupData);
    
    // Check for required keys
    const requiredKeys = [
      STORAGE_KEYS.CLIENTS,
      STORAGE_KEYS.USER_PREFERENCES,
      STORAGE_KEYS.DASHBOARD_SETTINGS
    ];
    
    const missingKeys = requiredKeys.filter(key => !backup[key]);
    
    if (missingKeys.length > 0) {
      return {
        isValid: false,
        issues: [`Missing essential data: ${missingKeys.join(', ')}`]
      };
    }
    
    // Validate data structures
    const clients = JSON.parse(backup[STORAGE_KEYS.CLIENTS] || "[]");
    if (!Array.isArray(clients)) {
      return {
        isValid: false,
        issues: ["Clients data is corrupted"]
      };
    }
    
    return {
      isValid: true,
      issues: []
    };
  } catch (error) {
    return {
      isValid: false,
      issues: [error instanceof Error ? error.message : "Invalid backup data format"]
    };
  }
}
