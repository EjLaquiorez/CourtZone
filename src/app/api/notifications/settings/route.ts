import { NextResponse } from 'next/server';
import { getSettingsStore, setSettingsStore } from '../_store';

export async function GET() {
  return NextResponse.json({ success: true, data: getSettingsStore() });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const current = getSettingsStore();

  const next = {
    email: { ...current.email, ...(body.email || {}) },
    push: { ...current.push, ...(body.push || {}) },
    inApp: { ...current.inApp, ...(body.inApp || {}) },
  };

  setSettingsStore(next);
  return NextResponse.json({ success: true, data: next });
}

