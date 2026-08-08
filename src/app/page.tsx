import Link from "next/link";

const demo = [
  ["0", "", "", "3", "", "", "0", ""],
  ["", "1", "", "", "", "3", "", ""],
  ["", "", "0", "", "2", "", "", "0"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
];

export default function Home() {
  return (
    <main className="landing">
      <nav className="site-nav">
        <Link href="/" className="wordmark"><span className="mark">T</span> Tablatura</Link>
        <Link href="/editor" className="nav-link">Abrir editor <span>↗</span></Link>
      </nav>

      <section className="hero">
        <div className="eyebrow">Editor gratuito de tablaturas</div>
        <h1>Sua música,<br /><em>linha por linha.</em></h1>
        <p className="hero-copy">Escreva tablaturas de violão direto no navegador. Simples, rápido e pronto para imprimir.</p>
        <Link href="/editor" className="primary-button">Criar tablatura <span>→</span></Link>
        <p className="microcopy">Sem cadastro. Sem complicação.</p>
      </section>

      <section className="demo-wrap" aria-label="Exemplo de tablatura">
        <div className="demo-head"><span>Dedilhado em C</span><span>♩ = 96</span></div>
        <div className="demo-tab">
          {["e", "B", "G", "D", "A", "E"].map((name, row) => (
            <div className="demo-string" key={name}>
              <span>{name}</span>
              <b>|</b>
              {demo[row].map((fret, col) => <i key={col}>{fret}</i>)}
              <b>|</b>
            </div>
          ))}
        </div>
        <div className="demo-caption"><span>Uma interface que parece papel.</span><span>Mas trabalha como um editor.</span></div>
      </section>

      <section className="benefits">
        <article><span>01</span><h2>Digite sem parar</h2><p>Use o teclado para inserir casas e navegar entre cordas e tempos.</p></article>
        <article><span>02</span><h2>Veja como vai ficar</h2><p>O que você edita na tela é exatamente o que vai para o papel.</p></article>
        <article><span>03</span><h2>Exporte em PDF</h2><p>Salve, imprima e compartilhe sua tablatura em poucos segundos.</p></article>
      </section>

      <footer><span>Tablatura</span><span>Feito para quem só quer tocar.</span></footer>
    </main>
  );
}
