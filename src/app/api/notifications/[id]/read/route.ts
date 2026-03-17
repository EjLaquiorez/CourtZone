import { NextResponse } from 'next/server';
import { getNotificationStore, setNotificationStore } from '../../_store';

export async function PATCH(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const current = getNotificationStore();
  const next = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  setNotificationStore(next);
  return NextResponse.json({ success: true, data: null, message: 'Marked as read' });
}

