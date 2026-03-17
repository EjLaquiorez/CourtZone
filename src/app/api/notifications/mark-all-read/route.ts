import { NextResponse } from 'next/server';
import { getNotificationStore, setNotificationStore } from '../_store';

export async function PATCH() {
  const current = getNotificationStore();
  const next = current.map((n) => ({ ...n, isRead: true }));
  setNotificationStore(next);
  return NextResponse.json({ success: true, data: null, message: 'All marked as read' });
}

