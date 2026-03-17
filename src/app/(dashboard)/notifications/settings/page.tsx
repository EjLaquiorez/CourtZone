'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/lib/stores/notification-store';

function ToggleRow(props: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="w-full flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-left hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-950"
      onClick={() => props.onChange(!props.checked)}
      aria-pressed={props.checked}
    >
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-slate-100">{props.label}</p>
        {props.description && <p className="text-[12px] text-slate-400 mt-0.5">{props.description}</p>}
      </div>
      <span
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          props.checked ? 'bg-primary-500' : 'bg-white/10'
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-slate-950 transition-transform',
            props.checked ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </span>
    </button>
  );
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { preferences, updatePreferences, isPushSupported, isPushEnabled, enablePushNotifications, disablePushNotifications } =
    useNotificationStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-sm border-b border-white/10">
        <div className="h-14 px-3 flex items-center gap-2">
          <button
            className="h-10 w-10 rounded-xl inline-flex items-center justify-center text-slate-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            onClick={() => router.back()}
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-slate-100">Notification settings</p>
            <p className="text-[11px] text-slate-400">Control what reaches you and how.</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-xl mx-auto space-y-6 pb-24">
        <section className="space-y-3">
          <h2 className="text-[12px] font-semibold tracking-wide text-slate-400">In-app</h2>
          <div className="space-y-2">
            <ToggleRow
              label="Game alerts"
              description="Invites, schedule changes, results, and live updates."
              checked={preferences.inApp.gameInvites && preferences.inApp.gameResults && preferences.inApp.liveGameUpdates}
              onChange={(checked) =>
                updatePreferences({
                  inApp: {
                    gameInvites: checked,
                    gameResults: checked,
                    liveGameUpdates: checked,
                  },
                })
              }
            />
            <ToggleRow
              label="Team activity"
              description="Invites, roster updates, and membership changes."
              checked={preferences.inApp.teamInvites}
              onChange={(checked) => updatePreferences({ inApp: { teamInvites: checked } })}
            />
            <ToggleRow
              label="Achievements & milestones"
              checked={preferences.inApp.achievements}
              onChange={(checked) => updatePreferences({ inApp: { achievements: checked } })}
            />
            <ToggleRow
              label="System announcements"
              checked={preferences.inApp.systemUpdates}
              onChange={(checked) => updatePreferences({ inApp: { systemUpdates: checked } })}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-[12px] font-semibold tracking-wide text-slate-400">Push</h2>
          {!isPushSupported ? (
            <div className="rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-[12px] text-slate-400">
              Push notifications aren’t supported in this browser/device.
            </div>
          ) : (
            <div className="space-y-2">
              <ToggleRow
                label="Enable push notifications"
                description="Allow Court Zone to send alerts even when you’re not in the app."
                checked={isPushEnabled}
                onChange={async (checked) => {
                  if (checked) await enablePushNotifications();
                  else await disablePushNotifications();
                }}
              />
              <ToggleRow
                label="Live game updates"
                checked={preferences.push.liveGameUpdates}
                onChange={(checked) => updatePreferences({ push: { liveGameUpdates: checked } })}
              />
              <ToggleRow
                label="Game invites"
                checked={preferences.push.gameInvites}
                onChange={(checked) => updatePreferences({ push: { gameInvites: checked } })}
              />
              <ToggleRow
                label="Team invites"
                checked={preferences.push.teamInvites}
                onChange={(checked) => updatePreferences({ push: { teamInvites: checked } })}
              />
              <ToggleRow
                label="Achievements"
                checked={preferences.push.achievements}
                onChange={(checked) => updatePreferences({ push: { achievements: checked } })}
              />
              <ToggleRow
                label="System announcements"
                checked={preferences.push.systemUpdates}
                onChange={(checked) => updatePreferences({ push: { systemUpdates: checked } })}
              />
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-[12px] font-semibold tracking-wide text-slate-400">Email</h2>
          <div className="space-y-2">
            <ToggleRow
              label="Game invites"
              checked={preferences.email.gameInvites}
              onChange={(checked) => updatePreferences({ email: { gameInvites: checked } })}
            />
            <ToggleRow
              label="Team invites"
              checked={preferences.email.teamInvites}
              onChange={(checked) => updatePreferences({ email: { teamInvites: checked } })}
            />
            <ToggleRow
              label="Game results"
              checked={preferences.email.gameResults}
              onChange={(checked) => updatePreferences({ email: { gameResults: checked } })}
            />
            <ToggleRow
              label="Achievements"
              checked={preferences.email.achievements}
              onChange={(checked) => updatePreferences({ email: { achievements: checked } })}
            />
            <ToggleRow
              label="System updates"
              checked={preferences.email.systemUpdates}
              onChange={(checked) => updatePreferences({ email: { systemUpdates: checked } })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

