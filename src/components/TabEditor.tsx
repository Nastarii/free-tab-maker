"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { Duration, Measure } from "@/models/tab";

const STRINGS = ["e", "B", "G", "D", "A", "E"];
const SLOTS = 16;
const DURATIONS: { value: Duration; label: string; symbol: string }[] = [
  { value: 1, label: "Inteira", symbol: "𝅝" },
  { value: 2, label: "Meia", symbol: "𝅗𝅥" },
  { value: 4, label: "1/4", symbol: "♩" },
  { value: 8, label: "1/8", symbol: "♪" },
];

const newMeasure = (): Measure => ({
  id: crypto.randomUUID(),
  cells: Array.from({ length: 6 }, () =>
    Array.from({ length: SLOTS }, () => ({ fret: "" })),
  ),
  durations: Array.from({ length: SLOTS }, () => 4 as Duration),
});

export default function TabEditor() {
  const [title, setTitle] = useState("Minha tablatura");
  const [artist, setArtist] = useState("");
  const [tempo, setTempo] = useState(96);
  const [measures, setMeasures] = useState<Measure[]>(() => [newMeasure(), newMeasure()]);
  const [active, setActive] = useState({ measure: 0, string: 0, slot: 0 });
  const [helpOpen, setHelpOpen] = useState(false);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const focusCell = (measure: number, string: number, slot: number) => {
    const m = Math.max(0, Math.min(measures.length - 1, measure));
    const s = Math.max(0, Math.min(5, string));
    const p = Math.max(0, Math.min(SLOTS - 1, slot));
    setActive({ measure: m, string: s, slot: p });
    requestAnimationFrame(() => inputs.current[`${m}-${s}-${p}`]?.focus());
  };

  const updateFret = (m: number, s: number, p: number, fret: string) => {
    if (!/^([0-9]{0,2}|[xX])$/.test(fret)) return;
    setMeasures((current) => current.map((measure, mi) => mi !== m ? measure : {
      ...measure,
      cells: measure.cells.map((row, si) => si !== s ? row : row.map((cell, pi) => pi === p ? { ...cell, fret: fret.toLowerCase() } : cell)),
    }));
  };

  const setDuration = (duration: Duration) => {
    const { measure: m, slot: p } = active;
    setMeasures((current) => current.map((measure, mi) => mi !== m ? measure : {
      ...measure,
      durations: measure.durations.map((value, pi) => pi === p ? duration : value),
    }));
  };

  const togglePause = () => {
    const { measure: m, string: s, slot: p } = active;
    if (!measures[m]?.cells[s][p].fret) return;
    setMeasures((current) => current.map((measure, mi) => mi !== m ? measure : {
      ...measure,
      cells: measure.cells.map((row, si) => si !== s ? row : row.map((cell, pi) => pi === p ? { ...cell, pause: !cell.pause } : cell)),
    }));
  };

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>, m: number, s: number, p: number) => {
    if (event.key === "ArrowRight" || event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      p < SLOTS - 1 ? focusCell(m, s, p + 1) : focusCell(m + 1, s, 0);
    } else if (event.key === "ArrowLeft" || event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      p > 0 ? focusCell(m, s, p - 1) : focusCell(m - 1, s, SLOTS - 1);
    } else if (event.key === "ArrowDown" || event.key === "Enter") {
      event.preventDefault(); focusCell(m, s + 1, p);
    } else if (event.key === "ArrowUp") {
      event.preventDefault(); focusCell(m, s - 1, p);
    } else if (event.key === "Backspace" && !event.currentTarget.value) {
      event.preventDefault(); p > 0 ? focusCell(m, s, p - 1) : focusCell(m - 1, s, SLOTS - 1);
    }
  };

  const removeMeasure = (index: number) => {
    if (measures.length === 1) return;
    setMeasures((current) => current.filter((_, i) => i !== index));
    setActive({ measure: 0, string: 0, slot: 0 });
  };

  return (
    <>
      <div className="editor-toolbar no-print">
        <div className="duration-group" aria-label="Duração da nota">
          <span className="duration-title">Duração do tempo selecionado</span>
          {DURATIONS.map((duration) => (
            <button key={duration.value} className={measures[active.measure]?.durations[active.slot] === duration.value ? "selected" : ""} onClick={() => setDuration(duration.value)} title={duration.label}>
              <span className="note">{duration.symbol}</span><small>{duration.label}</small>
            </button>
          ))}
          <button
            className={`pause-button ${measures[active.measure]?.cells[active.string][active.slot].pause ? "selected" : ""}`}
            onClick={togglePause}
            disabled={!measures[active.measure]?.cells[active.string][active.slot].fret}
            title="Manter esta nota soando"
          >
            <span className="pause-symbol">⌒</span><small>Nota prolongada</small>
          </button>
        </div>
        <div className="tempo-control">
          <label htmlFor="tempo">BPM</label>
          <input id="tempo" type="number" min="30" max="300" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} />
        </div>
        <button className="help-button" onClick={() => setHelpOpen(true)}><span>?</span> Como usar</button>
        <button className="export-button" onClick={() => window.print()}><span>↓</span> Exportar PDF</button>
      </div>

      <section className="paper">
        <header className="score-header">
          <div>
            <input className="title-input" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Título" placeholder="Título da tablatura" />
            <input className="artist-input" value={artist} onChange={(e) => setArtist(e.target.value)} aria-label="Artista" placeholder="Artista / autor (opcional)" />
          </div>
          <span className="score-tempo">♩ = {tempo}</span>
        </header>

        <div className="measures">
          {measures.map((measure, m) => (
            <div className="measure-wrap" key={measure.id}>
              <div className="measure-label"><span>Compasso {m + 1}</span><button className="no-print" onClick={() => removeMeasure(m)} aria-label={`Remover compasso ${m + 1}`}>×</button></div>
              <div
                className="measure"
                style={{ "--slot-columns": `repeat(${SLOTS}, minmax(28px, 1fr))` } as CSSProperties}
              >
                {STRINGS.map((name, s) => (
                  <div className="tab-row" key={name}>
                    <span className="string-name">{name}</span><b className="bar">|</b>
                    {measure.cells[s].map((cell, p) => (
                      <span className="cell" key={p} data-beat={p % 2 === 0 ? "true" : undefined} data-has-note={cell.fret ? "true" : undefined}>
                        <input
                          ref={(el) => { inputs.current[`${m}-${s}-${p}`] = el; }}
                          value={cell.fret}
                          onChange={(e) => updateFret(m, s, p, e.target.value)}
                          onFocus={() => setActive({ measure: m, string: s, slot: p })}
                          onKeyDown={(e) => handleKey(e, m, s, p)}
                          inputMode="numeric"
                          aria-label={`Corda ${name}, posição ${p + 1}`}
                        />
                        {cell.pause && cell.fret && (
                          <i className={`pause-arc ${s < 2 ? "pause-arc-up" : "pause-arc-down"}`} aria-hidden="true" />
                        )}
                      </span>
                    ))}
                    <b className="bar">|</b>
                  </div>
                ))}
                <div className="rhythm-row" aria-label="Representação rítmica">
                  <span /><span />
                  {measure.durations.map((duration, p) => {
                    const stringsWithNotes = measure.cells
                      .map((row, string) => row[p].fret ? string : -1)
                      .filter((string) => string >= 0);
                    const hasNotes = stringsWithNotes.length > 0;
                    const previousHasNotes = p > 0 && measure.cells.some((row) => row[p - 1].fret);
                    const connectionCount = duration === 1 ? 0 : Math.log2(duration);
                    return (
                      <span className={`rhythm-slot duration-${duration}`} key={p}>
                        {hasNotes && (
                          <>
                            <i className="rhythm-stem" />
                            {previousHasNotes && Array.from({ length: connectionCount }, (_, beam) => (
                              <b className="rhythm-beam" style={{ "--beam-offset": `${beam * 6}px` } as CSSProperties} key={beam} />
                            ))}
                          </>
                        )}
                      </span>
                    );
                  })}
                  <span />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="add-measure no-print" onClick={() => setMeasures((m) => [...m, newMeasure()])}><span>＋</span> Adicionar compasso</button>
      </section>

      <div className="editor-help no-print"><span><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> navegar</span><span><kbd>Tab</kbd> próxima posição</span><span><kbd>Enter</kbd> próxima corda</span><span>Use <strong>x</strong> para nota abafada</span></div>

      {helpOpen && (
        <div className="help-overlay no-print" role="presentation" onMouseDown={() => setHelpOpen(false)}>
          <section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="help-close" onClick={() => setHelpOpen(false)} aria-label="Fechar ajuda">×</button>
            <span className="eyebrow">Guia rápido</span>
            <h2 id="help-title">Como criar sua tablatura</h2>
            <ol>
              <li><b>Insira uma nota</b><span>Clique sobre uma linha e digite o número da casa, de 0 a 99. Digite <strong>x</strong> para uma nota abafada.</span></li>
              <li><b>Escolha a duração</b><span>Selecione uma posição e escolha Inteira, Meia, 1/4 ou 1/8. A duração vale para todas as cordas naquela coluna.</span></li>
              <li><b>Navegue rapidamente</b><span>Use as setas entre posições e cordas. <kbd>Tab</kbd> avança e <kbd>Enter</kbd> desce para a próxima corda.</span></li>
              <li><b>Monte e exporte</b><span>Adicione quantos compassos precisar. Ao terminar, clique em Exportar PDF e escolha “Salvar como PDF”.</span></li>
            </ol>
            <button className="help-done" onClick={() => setHelpOpen(false)}>Entendi</button>
          </section>
        </div>
      )}
    </>
  );
}
