import { useState, useEffect } from 'react';
import { User, Bot, Save, Brain, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import { Badge, Button, Card, StatusDot } from '../../components/ui';

const USER_MD_TEMPLATE = `## My working style
I prefer concise, direct answers. Skip long preambles.

## Response format
- Use markdown: tables for comparisons, code blocks for commands
- For multi-step tasks: show numbered steps, confirm before executing

## My timezone
UTC+8 (Beijing / Singapore)

## My current focus
<!-- Tell your agent what you're working on this week -->

## My preferences
<!-- Add personal preferences that should always apply -->
`;


export default function PortalProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userMd, setUserMd] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMemory, setShowMemory] = useState(false);

  useEffect(() => {
    api.get<any>('/portal/profile').then(data => {
      setProfile(data);
      setUserMd(data.userMd || '');
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/portal/profile', { userMd });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {}
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-text-primary">My Profile</h1>

      {/* Basic Info */}
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary text-xl font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{user?.name}</h2>
            <p className="text-sm text-text-muted">{user?.positionName} · {user?.departmentName}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-text-muted">Employee ID</p><p className="text-sm font-medium">{user?.id}</p></div>
          <div><p className="text-xs text-text-muted">Position</p><p className="text-sm font-medium">{user?.positionName}</p></div>
          <div><p className="text-xs text-text-muted">Department</p><p className="text-sm font-medium">{user?.departmentName}</p></div>
          <div>
            <p className="text-xs text-text-muted">Agent</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Bot size={14} className="text-green-400" />
              <span className="text-sm font-medium">{profile?.agent?.name || 'Not assigned'}</span>
              {profile?.agent && <StatusDot status={profile.agent.status} />}
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Tell Your Agent About Yourself (USER.md)</h3>
            <p className="text-xs text-text-muted">Your agent reads this every session — the more detail you add, the better it adapts to you</p>
          </div>
          <div className="flex gap-2">
            {!userMd && (
              <Button variant="default" size="sm" onClick={() => setUserMd(USER_MD_TEMPLATE)}>
                Use template
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              <Save size={14} /> {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
            </Button>
          </div>
        </div>
        {!userMd && (
          <div className="mb-3 rounded-xl bg-info/5 border border-info/20 px-3 py-2.5 text-xs text-info">
            This file is empty. Click <strong>Use template</strong> to get started with suggestions,
            or write freely — tell your agent your working style, timezone, preferred formats, and current focus.
          </div>
        )}
        <textarea
          value={userMd}
          onChange={e => setUserMd(e.target.value)}
          rows={12}
          placeholder={USER_MD_TEMPLATE}
          className="w-full rounded-xl border border-dark-border/60 bg-dark-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-primary/60 focus:outline-none font-mono resize-y"
        />
      </Card>

      {/* Memory */}
      <Card>
        <button className="w-full flex items-center justify-between" onClick={() => setShowMemory(s => !s)}>
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-primary-light" />
            <h3 className="text-sm font-semibold text-text-primary">What My Agent Remembers</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              {profile?.memoryMdSize ? `${(profile.memoryMdSize / 1024).toFixed(1)} KB` : 'Empty'}
            </span>
            {showMemory ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
          </div>
        </button>
        {showMemory && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-info/5 border border-info/20 px-3 py-2 text-xs text-info">
              This is your agent's persistent memory — it's automatically updated as you work together.
              It helps your agent maintain context across sessions. You can't edit this directly.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface-dim px-4 py-3">
                <p className="text-xs text-text-muted mb-1">MEMORY.md size</p>
                <p className="text-sm font-semibold text-text-primary">{profile?.memoryMdSize ? `${(profile.memoryMdSize / 1024).toFixed(1)} KB` : '—'}</p>
              </div>
              <div className="rounded-xl bg-surface-dim px-4 py-3">
                <p className="text-xs text-text-muted mb-1">Daily memory files</p>
                <p className="text-sm font-semibold text-text-primary">{profile?.dailyMemoryCount || 0}</p>
              </div>
            </div>
            {profile?.memoryPreview && (
              <pre className="rounded-xl bg-dark-bg border border-dark-border/40 px-4 py-3 text-xs text-text-secondary whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {profile.memoryPreview}
              </pre>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
