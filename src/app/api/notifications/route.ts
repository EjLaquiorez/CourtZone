import { NextResponse } from 'next/server';
import type { Notification } from '@/types';
import { getNotificationStore, setNotificationStore } from './_store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const limit = Number(url.searchParams.get('limit') || '20');
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

  const all = getNotificationStore()
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = unreadOnly ? all.filter((n) => !n.isRead) : all;

  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;

  const notifications = filtered.slice(start, end) as Notification[];
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return NextResponse.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
      },
    },
  });
}

export async function DELETE() {
  setNotificationStore([]);
  return NextResponse.json({ success: true, data: null, message: 'Cleared' });
}

