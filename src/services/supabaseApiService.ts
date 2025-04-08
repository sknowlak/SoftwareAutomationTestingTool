/**
 * Supabase API Service
 * Handles API calls to Supabase backend
 */
import { supabase } from './supabaseClient';
import { TestCase, TestSuite } from './testMetricsService';

/**
 * Get configuration data
 * @returns Promise resolving to configuration data
 */
export const getConfig = async (): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching config from Supabase:', error);
    throw error;
  }
};

/**
 * Save test results
 * @param testResults Test results to save
 * @returns Promise resolving to success status
 */
export const saveTestResults = async (testResults: any): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('test_results')
      .insert(testResults);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving test results to Supabase:', error);
    return false;
  }
};

/**
 * Get test results
 * @returns Promise resolving to test results
 */
export const getTestResults = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching test results from Supabase:', error);
    return [];
  }
};

/**
 * Get test cases
 * @returns Promise resolving to test cases
 */
export const getTestCases = async (): Promise<TestCase[]> => {
  try {
    const { data, error } = await supabase
      .from('test_cases')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching test cases from Supabase:', error);
    return [];
  }
};

/**
 * Get test suites
 * @returns Promise resolving to test suites
 */
export const getTestSuites = async (): Promise<TestSuite[]> => {
  try {
    const { data, error } = await supabase
      .from('test_suites')
      .select('*, test_cases(*)');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching test suites from Supabase:', error);
    return [];
  }
};

/**
 * Save email notification
 * @param notification Email notification data
 * @returns Promise resolving to success status
 */
export const saveEmailNotification = async (notification: any): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('email_notifications')
      .insert(notification);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving email notification to Supabase:', error);
    return false;
  }
};

export default {
  getConfig,
  saveTestResults,
  getTestResults,
  getTestCases,
  getTestSuites,
  saveEmailNotification
};
