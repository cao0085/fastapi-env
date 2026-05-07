// ScoreView.tsx — OSMD wrapper
// Renders a MusicXML string as SVG. Reacts to zoom / transpose changes.
//
// npm i opensheetmusicdisplay

import { useEffect, useRef } from 'react';
import {
  OpenSheetMusicDisplay,
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
  drawTitle: false,      // we render our own TitleBar
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
    osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, OSMD_OPTS);
    return () => {
      osmdRef.current?.clear();
      osmdRef.current = null;
    };
  }, []);

  // Load + render whenever inputs change
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !musicXml) return;

    let cancelled = false;
    (async () => {
      try {
        await osmd.load(musicXml);
        if (cancelled) return;
        osmd.zoom = zoom;
        // OSMD transpose plugin is built-in; semitones via Transpose option
        if (transpose !== 0 && osmd.Sheet?.Transpose !== undefined) {
          osmd.Sheet.Transpose = transpose;
          osmd.updateGraphic();
        }
        osmd.render();
      } catch (err) {
        console.error('[ScoreView] render failed', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [musicXml, zoom, transpose]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        minHeight: 400,
        padding: '32px 40px',
        background: 'var(--paper)',
        color: 'var(--ink)',
        overflow: 'auto',
      }}
    />
  );
}
