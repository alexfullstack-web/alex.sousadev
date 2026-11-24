import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const ICONES = { erro: XCircle, ok: CheckCircle2, info: Info, alerta: AlertTriangle };

// Mensagem de erro, sucesso, informação ou alerta. Erro é anunciado na hora (alert); o resto, com calma (status).
export default function Aviso({ tipo = 'erro', children, className = '' }) {
  if (!children) return null;
  const Icone = ICONES[tipo] ?? Info;
  return (
    <div className={`aviso aviso--${tipo} ${className}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <Icone size={19} aria-hidden="true" />
      <div className="aviso__corpo">{children}</div>
    </div>
  );
}
