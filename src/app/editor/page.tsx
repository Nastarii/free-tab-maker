import Link from "next/link";
import TabEditor from "@/components/TabEditor";

export default function EditorPage() {
  return (
    <main className="editor-page">
      <nav className="editor-nav no-print">
        <Link href="/" className="wordmark"><span className="mark">T</span> Tablatura</Link>
        <span className="saved-state"><i /> Edição local</span>
      </nav>
      <div className="editor-shell">
        <div className="editor-heading no-print"><div><span className="eyebrow">Editor</span><h1>Escreva como você toca.</h1></div><p>Clique em uma posição e digite o número da casa.</p></div>
        <TabEditor />
      </div>
    </main>
  );
}
