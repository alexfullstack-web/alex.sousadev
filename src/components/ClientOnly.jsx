// Mostra o conteúdo só no navegador: para partes que dependem do que este navegador guardou
// (pedidos de orçamento, conversa do chat) e não existem no HTML gerado no build.
import { useEffect, useState } from 'react';

export default function ClientOnly({ children, fallback = null }) {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  return montado ? children : fallback;
}
