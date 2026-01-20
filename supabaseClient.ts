
import { createClient } from '@supabase/supabase-js'

/**
 * NOTE: The remote database is currently unreachable (Failed to fetch).
 * The application has been refactored to use Local Storage for persistence.
 * This file remains for future reconnection but is currently inactive.
 */

const supabaseUrl = 'https://hsawpwqrngoiajhgutpn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYXdwd3FybmdvaWFqaGd1dHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTI5NzgsImV4cCI6MjA3NDY4ODk3OH0.i1mTGBFIYYHq99xzOP4HxAvuX01UUCS2jiYSBhShc8g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
