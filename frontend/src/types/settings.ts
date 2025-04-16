export interface BusinessSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  tax_id?: string;
  currency: string;
  timezone: string;
  date_format: string;
  logo_url?: string;
}

export interface SystemSettings {
  maintenance_mode: boolean;
  allow_registration: boolean;
  require_email_verification: boolean;
  session_timeout: number;
  max_login_attempts: number;
  password_policy: {
    min_length: number;
    require_numbers: boolean;
    require_special_chars: boolean;
    require_uppercase: boolean;
  };
}

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
}

export interface StorageSettings {
  type: 'local' | 's3' | 'azure' | 'gcs';
  local_path?: string;
  s3_bucket?: string;
  s3_region?: string;
  s3_access_key?: string;
  s3_secret_key?: string;
  azure_container?: string;
  azure_connection_string?: string;
  gcs_bucket?: string;
  gcs_credentials?: string;
}

export interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retention_days: number;
  storage_type: 'local' | 's3' | 'azure' | 'gcs';
  storage_path?: string;
} 