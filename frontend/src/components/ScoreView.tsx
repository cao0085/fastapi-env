// ScoreView.tsx — OSMD wrapper
// Renders a MusicXML string as SVG. Reacts to zoom / transpose changes.
//
// npm i opensheetmusicdisplay

import { useEffect, useRef } from 'react';
import {
  OpenSheetMusicDisplay,
  TransposeCalculator,
  type IOSMDOptions,
} from 'opensheetmusicdisplay';

export interface ScoreViewProps {
  musicXml: string | null;
  zoom?: number;       // 1.0 = 100%
  transpose?: number;  // semitones
  drawTitle?: boolean;
  className?: string;
}

const OSMD_OPTS: IOSMDOptions = {
  autoResize: true,
  backend: 'svg',
  drawTitle: true,
  drawComposer: false,
  drawCredits: false,
  drawSubtitle: false,
  drawPartNames: false,
  followCursor: true,
};

export function ScoreView({
  musicXml,
  zoom = 1,
  transpose = 0,
  className,
}: ScoreViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

  // Init once
  useEffect(() => {
    if (!containerRef.current) return;
    const osmd = new OpenSheetMusicDisplay(containerRef.current, OSMD_OPTS);
    osmdRef.current = osmd;
    return () => {
      osmdRef.current?.clear();
      osmdRef.current = null;
    };
  }, []);

  // Reload + render whenever XML or transpose changes
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !musicXml) return;

    let cancelled = false;
    (async () => {
      try {
        await osmd.load(musicXml);
        if (cancelled) return;
        osmd.TransposeCalculator = new TransposeCalculator();
        osmd.zoom = zoom;
        osmd.Sheet.Transpose = transpose;
        osmd.updateGraphic();
        osmd.render();
      } catch (err) {
        console.error('[ScoreView] render failed', err);
      }
    })();

    return () => { cancelled = true; };
  }, [musicXml, transpose]);

  // Zoom only — no reload needed
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !osmd.Sheet) return;
    osmd.zoom = zoom;
    osmd.render();
  }, [zoom]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '80%',
        minHeight: 400,
        margin: '0 auto',
        padding: '32px 40px',
        background: 'var(--paper)',
        color: 'var(--ink)',
      }}
    />
  );
}
