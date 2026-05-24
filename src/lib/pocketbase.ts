import PocketBase from 'pocketbase';
import { legislationData, type Legislation } from '../data/legislation';

const PB_URL = import.meta.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(PB_URL);

// Prevent auto-cancellation of pending requests in dev hot-reloads
pb.autoCancellation(false);

export interface LegislationRecord extends Legislation {
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

/**
 * Fetches all legislation items from PocketBase.
 * Falls back to static mock data if the server is offline or empty.
 */
export async function getLegislationList(): Promise<Legislation[]> {
  try {
    // Try fetching with a short timeout to prevent long hangs if server is offline
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const records = await pb.collection('legislation').getFullList<LegislationRecord>({
      sort: '-date',
      $cancelKey: 'fetch_legislation',
    });

    clearTimeout(timeoutId);

    if (records.length === 0) {
      console.warn('PocketBase legislation collection is empty. Using mock data.');
      return legislationData;
    }

    // Map PocketBase fields to the local Legislation interface
    return records.map(record => ({
      id: record.id,
      title: record.title,
      category: record.category,
      date: formatDate(record.date),
      documentNo: record.documentNo,
      url: record.url ? (record.url.startsWith('http') ? record.url : pb.files.getURL(record, record.url)) : '#',
      description: record.description,
    }));
  } catch (error) {
    console.warn('Failed to fetch from PocketBase, falling back to mock data:', error);
    return legislationData;
  }
}

/**
 * Helper to ensure dates are in the correct visual format (DD.MM.YYYY)
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Check if already in DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  try {
    // PocketBase dates come as YYYY-MM-DD HH:MM:SS or ISO
    const date = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return dateStr;
  }
}
