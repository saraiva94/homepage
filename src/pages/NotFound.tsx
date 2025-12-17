import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main style={{ padding: 32, fontFamily: "system-ui", textAlign: "center" }}>
      <h1>404 - Página não encontrada</h1>
      <Link to="/">Voltar ao início</Link>
    </main>
  );
}
