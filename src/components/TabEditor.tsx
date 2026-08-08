"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { Duration, Measure, Tab } from "@/models/tab";

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
  durations: Array.from({ length: SLOTS }, () => 1 as Duration),
  chords: Array.from({ length: SLOTS }, () => ""),
});

export default function TabEditor() {
  const [title, setTitle] = useState("Minha tablatura");
  const [artist, setArtist] = useState("");
  const [tempo, setTempo] = useState(96);
  const [measures, setMeasures] = useState<Measure[]>(() => [newMeasure(), newMeasure()]);
  const [active, setActive] = useState({ measure: 0, string: 0, slot: 0 });
  const [helpOpen, setHelpOpen] = useState(false);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const importInput = useRef<HTMLInputElement | null>(null);

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

  const updateChord = (m: number, p: number, chord: string) => {
    if (chord.length > 8) return;
    setMeasures((current) => current.map((measure, mi) => mi !== m ? measure : {
      ...measure,
      chords: measure.chords.map((value, pi) => pi === p ? chord : value),
    }));
  };

  const togglePause = () => {
    const { measure: m, slot: p } = active;
    if (!measures[m]?.cells.some((row) => row[p].fret)) return;
    const shouldAddPause = !measures[m].cells.some((row) => row[p].pause);
    setMeasures((current) => current.map((measure, mi) => mi !== m ? measure : {
      ...measure,
      cells: measure.cells.map((row) => row.map((cell, pi) => pi === p ? { ...cell, pause: shouldAddPause } : cell)),
    }));
  };

  const toggleTechnique = (technique: "hammer" | "pull") => {
    const { measure: m, string: s, slot: p } = active;
    if (!measures[m]?.cells[s][p].fret) return;
    setMeasures((current) => current.map((measure, mi) => mi !== m ? measure : {
      ...measure,
      cells: measure.cells.map((row, si) => si !== s ? row : row.map((cell, pi) => pi === p ? {
        ...cell,
        technique: cell.technique === technique ? undefined : technique,
      } : cell)),
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

  const exportJson = () => {
    const tab: Tab = { title, artist, tempo, measures };
    const blob = new Blob([JSON.stringify(tab, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tablatura";
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isValidTab(data)) throw new Error("Formato inválido");
      setTitle(data.title);
      setArtist(data.artist);
      setTempo(data.tempo);
      setMeasures(data.measures);
      setActive({ measure: 0, string: 0, slot: 0 });
    } catch {
      window.alert("Não foi possível importar este arquivo. Selecione um JSON exportado pelo editor.");
    }
  };

  return (
    <>
      <div className="editor-toolbar no-print">
        <div className="duration-group" aria-label="Duração da nota">
          {DURATIONS.map((duration) => (
            <button key={duration.value} className={measures[active.measure]?.durations[active.slot] === duration.value ? "selected" : ""} onClick={() => setDuration(duration.value)} title={duration.label}>
              <span className="note">{duration.symbol}</span><small>{duration.label}</small>
            </button>
          ))}
          <button
            className={`pause-button ${measures[active.measure]?.cells.some((row) => row[active.slot].pause) ? "selected" : ""}`}
            onClick={togglePause}
            disabled={!measures[active.measure]?.cells.some((row) => row[active.slot].fret)}
            title="Manter as notas desta coluna soando"
          >
            <span className="pause-symbol">⌒</span><small>Nota prolongada</small>
          </button>
          <button
            className={measures[active.measure]?.cells[active.string][active.slot].technique === "hammer" ? "selected" : ""}
            onClick={() => toggleTechnique("hammer")}
            disabled={!measures[active.measure]?.cells[active.string][active.slot].fret}
            title="Hammer-on na nota selecionada"
          >
            <span className="pause-symbol">⌒</span><small>Hammer</small>
          </button>
          <button
            className={measures[active.measure]?.cells[active.string][active.slot].technique === "pull" ? "selected" : ""}
            onClick={() => toggleTechnique("pull")}
            disabled={!measures[active.measure]?.cells[active.string][active.slot].fret}
            title="Pull-off na nota selecionada"
          >
            <span className="pause-symbol">⌢</span><small>Pull</small>
          </button>
        </div>
        <div className="tempo-control">
          <label htmlFor="tempo">BPM</label>
          <input id="tempo" type="number" min="30" max="300" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} />
        </div>
        <button className="help-button" onClick={() => setHelpOpen(true)}><span>?</span> Como usar</button>
        <button className="json-button" onClick={exportJson}>Exportar JSON</button>
        <button className="json-button" onClick={() => importInput.current?.click()}>Importar JSON</button>
        <input ref={importInput} className="json-file-input" type="file" accept="application/json,.json" onChange={importJson} />
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
                <div className="chord-row">
                  <span /><span />
                  {measure.chords.map((chord, p) => (
                    <input
                      key={p}
                      value={chord}
                      onChange={(event) => updateChord(m, p, event.target.value)}
                      placeholder={p === 0 ? "Em" : ""}
                      aria-label={`Acorde na posição ${p + 1}`}
                    />
                  ))}
                  <span />
                </div>
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
                        {cell.technique && cell.fret && (
                          <i className={`pause-arc technique-arc ${cell.technique === "hammer" ? "pause-arc-up" : "pause-arc-down"}`} aria-hidden="true" />
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
              <li><b>Insira notas e cifras</b><span>Digite uma casa de 0 a 99 ou <strong>x</strong> para uma nota abafada. Acima das cordas, escreva cifras opcionais como <strong>Em</strong>; deixe as demais posições vazias.</span></li>
              <li><b>Defina a duração</b><span>Escolha Inteira, Meia, 1/4 ou 1/8. A duração vale para toda a coluna; Inteira é o padrão. As hastes abaixo mostram 0, 1, 2 ou 3 barras.</span></li>
              <li><b>Prolongue o som</b><span>Selecione qualquer posição da coluna e clique em <strong>Nota prolongada</strong>. O arco será aplicado a todas as notas existentes nessa coluna.</span></li>
              <li><b>Hammer e Pull</b><span>Selecione uma nota e use <strong>Hammer</strong> para um arco para cima ou <strong>Pull</strong> para um arco para baixo. Clique novamente no botão ativo para remover.</span></li>
              <li><b>Navegue rápido</b><span>Use as setas entre posições e cordas. <kbd>Tab</kbd> avança, <kbd>Shift</kbd> + <kbd>Tab</kbd> volta e <kbd>Enter</kbd> desce uma corda.</span></li>
              <li><b>Organize a música</b><span>Ajuste o BPM no topo e use <strong>Adicionar compasso</strong> ou × para montar a tablatura. Cada compasso possui 16 posições.</span></li>
              <li><b>Salve ou restaure</b><span>Use <strong>Exportar JSON</strong> para salvar todo o projeto e <strong>Importar JSON</strong> para restaurá-lo exatamente como estava.</span></li>
              <li><b>Exporte o PDF</b><span>Clique em <strong>Exportar PDF</strong> e escolha “Salvar como PDF”. O arquivo preserva cifras, cordas, casas, durações, hastes e arcos.</span></li>
            </ol>
            <button className="help-done" onClick={() => setHelpOpen(false)}>Entendi</button>
          </section>
        </div>
      )}
    </>
  );
}

function isValidTab(data: unknown): data is Tab {
  if (!data || typeof data !== "object") return false;
  const tab = data as Partial<Tab>;
  if (typeof tab.title !== "string" || typeof tab.artist !== "string" || typeof tab.tempo !== "number" || !Array.isArray(tab.measures) || tab.measures.length === 0) return false;

  return tab.measures.every((measure) =>
    measure &&
    typeof measure.id === "string" &&
    Array.isArray(measure.durations) &&
    measure.durations.length === SLOTS &&
    measure.durations.every((duration) => DURATIONS.some(({ value }) => value === duration)) &&
    Array.isArray(measure.chords) &&
    measure.chords.length === SLOTS &&
    measure.chords.every((chord) => typeof chord === "string") &&
    Array.isArray(measure.cells) &&
    measure.cells.length === 6 &&
    measure.cells.every((row) => Array.isArray(row) && row.length === SLOTS && row.every((cell) =>
      cell &&
      typeof cell.fret === "string" &&
      (cell.pause === undefined || typeof cell.pause === "boolean") &&
      (cell.technique === undefined || cell.technique === "hammer" || cell.technique === "pull")
    ))
  );
}
