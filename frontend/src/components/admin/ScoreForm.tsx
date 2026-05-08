import { useState, useRef } from 'react';
import type { MusicScore } from '../../models/music-score';

const BACKEND = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

type Errors = Partial<Record<keyof MusicScore, string>>;

function validate(form: MusicScore): Errors {
  const errors: Errors = {};
  if (!form.id.trim())        errors.id       = 'required';
  if (!form.title.trim())     errors.title    = 'required';
  if (!form.composer.trim())  errors.composer = 'required';
  if (!form.key.trim())       errors.key      = 'required';
  if (!form.time_sig.trim())  errors.time_sig = 'required';
  if (!form.xml_url.trim())   errors.xml_url  = 'required';
  return errors;
}

interface Props {
  initial: MusicScore;
  onSave: (score: MusicScore) => void;
}

export function ScoreForm({ initial, onSave }: Props) {
  const [form, setForm] = useState<MusicScore>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof MusicScore, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleXmlUpload = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`${BACKEND}/admin/scores/upload-xml`, { method: 'POST', body });
      if (!res.ok) throw new Error('upload failed');
      const { xml_url } = await res.json();
      set('xml_url', xml_url);
      if (!form.id) set('id', file.name.replace('.xml', ''));
    } catch (e) {
      alert('XML upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.xml')) handleXmlUpload(file);
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24, color: 'var(--ink-mute)' }}>
        {initial.id ? `editing — ${initial.id}` : 'new score'}
      </div>

      <Field label="ID (slug)" error={errors.id}>
        <Input value={form.id} onChange={v => set('id', v)} placeholder="autumn-leaves" error={!!errors.id} />
      </Field>
      <Field label="Title" error={errors.title}>
        <Input value={form.title} onChange={v => set('title', v)} placeholder="Autumn Leaves" error={!!errors.title} />
      </Field>
      <Field label="Composer" error={errors.composer}>
        <Input value={form.composer} onChange={v => set('composer', v)} placeholder="J. Kosma" error={!!errors.composer} />
      </Field>
      <Field label="Key" error={errors.key}>
        <Input value={form.key} onChange={v => set('key', v)} placeholder="E min" error={!!errors.key} />
      </Field>
      <Field label="Time Sig" error={errors.time_sig}>
        <Input value={form.time_sig} onChange={v => set('time_sig', v)} placeholder="4/4" error={!!errors.time_sig} />
      </Field>
      <Field label="Tempo">
        <Input value={form.tempo} onChange={v => set('tempo', v)} placeholder="132" />
      </Field>
      <Field label="Form">
        <Input value={form.form ?? ''} onChange={v => set('form', v || null)} placeholder="AABA" />
      </Field>
      <Field label="Tags (comma separated)">
        <Input
          value={form.tags.join(', ')}
          onChange={v => set('tags', v.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="ballad, swing"
        />
      </Field>

      {/* XML upload */}
      <Field label="XML File" error={errors.xml_url}>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--rule)'}`,
            borderRadius: 6,
            padding: '14px 16px',
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-mute)',
            textAlign: 'center',
          }}
        >
          {uploading ? 'uploading…' : form.xml_url ? form.xml_url : 'drag & drop .xml or click'}
        </div>
        <input ref={fileRef} type="file" accept=".xml" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleXmlUpload(f); }} />
      </Field>

      {/* toggles */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <Toggle label="Verified" value={form.is_verified} onChange={v => set('is_verified', v)} />
        <Toggle label="Preview" value={form.is_preview} onChange={v => set('is_preview', v)} />
      </div>

      <button
        onClick={() => {
          const errs = validate(form);
          setErrors(errs);
          if (Object.keys(errs).length === 0) onSave(form);
        }}
        style={{
          padding: '10px 28px',
          fontFamily: 'var(--mono)',
          fontSize: 12,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          border: '1.5px solid var(--ink)',
          borderRadius: 4,
          background: 'var(--ink)',
          color: 'var(--paper)',
          cursor: 'pointer',
        }}
      >
        save
      </button>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: error ? 'var(--accent)' : 'var(--ink-mute)', marginBottom: 6 }}>
        {label}{error && ` — ${error}`}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, error }: { value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: '8px 10px',
        fontFamily: 'var(--sans)', fontSize: 14,
        border: `1.2px solid ${error ? 'var(--accent)' : 'var(--rule)'}`, borderRadius: 4,
        background: 'transparent', color: 'var(--ink)', outline: 'none',
      }}
    />
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</span>
    </label>
  );
}
