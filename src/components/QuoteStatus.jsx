// Pedidos de orçamento feitos NESTE navegador e a situação de cada um (consulta segura: só
// quem tem o token do pedido vê a situação; nenhum dado pessoal volta da API).
import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { local, mensagemDeErro, site } from '../api.js';
import { CHAVE_PEDIDOS } from './QuoteForm.jsx';

const dia = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function QuoteStatus({ versao = 0 }) {
  const [pedidos, setPedidos] = useState(() => local.ler(CHAVE_PEDIDOS, []));
  const [status, setStatus] = useState({});
  const [carregando, setCarregando] = useState(false);
  const consultar = useCallback(async (lista) => {
    if (!lista.length) return;
    setCarregando(true);
    const res = {};
    await Promise.all(
      lista.map(async (p) => {
        try {
          res[p.protocolo] = await site.statusOrcamento(p.token);
        } catch (e) {
          res[p.protocolo] = { erro: e?.response?.status === 401 ? 'Pedido não encontrado.' : mensagemDeErro(e) };
        }
      }),
    );
    setStatus(res);
    setCarregando(false);
  }, []);
  useEffect(() => {
    const l = local.ler(CHAVE_PEDIDOS, []);
    setPedidos(l);
    consultar(l);
  }, [versao, consultar]);
  if (!pedidos.length) return null;
  const esquecer = (protocolo) => {
    const l = pedidos.filter((p) => p.protocolo !== protocolo);
    local.salvar(CHAVE_PEDIDOS, l);
    setPedidos(l);
  };
  return (
    <section className="orc-status" aria-labelledby="orc-status-titulo">
      <div className="orc-status__topo">
        <h3 id="orc-status-titulo">Seus pedidos</h3>
        <button type="button" className="botao botao--fantasma botao--p" onClick={() => consultar(pedidos)} disabled={carregando}>
          {carregando ? <Loader2 size={15} className="girando" aria-hidden="true" /> : <RefreshCw size={15} aria-hidden="true" />} Atualizar
        </button>
      </div>
      <ul>
        {pedidos.map((p) => {
          const s = status[p.protocolo];
          return (
            <li key={p.protocolo} className="orc-status__item">
              <div>
                <strong>{p.protocolo}</strong>
                <span>
                  {p.tipo} · enviado em {dia(p.em)}
                </span>
              </div>
              <span className={`orc-status__situacao orc-status__situacao--${(s?.status || 'carregando').toLowerCase()}`}>{s ? s.erro || s.statusRotulo : 'Consultando…'}</span>
              <button type="button" className="orc-status__esquecer" onClick={() => esquecer(p.protocolo)} aria-label={`Remover ${p.protocolo} desta lista`} title="Remover desta lista (o pedido continua com a equipe)">
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="orc-nota">A lista fica só neste navegador. Remover daqui não cancela o pedido.</p>
    </section>
  );
}
