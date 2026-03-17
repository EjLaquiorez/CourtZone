import { NextResponse } from 'next/server';
import { getNotificationStore, setNotificationStore } from '../_store';

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const current = getNotificationStore();
  const next = current.filter((n) => n.id !== id);
  setNotificationStore(next);
  return NextResponse.json({ success: true, data: null, message: 'Deleted' });
}

