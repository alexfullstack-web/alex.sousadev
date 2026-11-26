// Ilustração tecnológica original do topo da página inicial, feita só com React + CSS.
// Um núcleo com o "AS" da marca, órbitas com as frentes de trabalho da empresa, uma janela
// de código e um cartão com o que todo projeto recebe. Decorativa: nada de números inventados.
import { Cloud, Code2, Database, ShieldCheck, Smartphone, Sparkles, Check } from 'lucide-react';

const SATELITES_1 = [
  { icone: Code2, rotulo: 'Código' },
  { icone: Smartphone, rotulo: 'Mobile' },
  { icone: Database, rotulo: 'Dados' },
];
const SATELITES_2 = [
  { icone: Cloud, rotulo: 'Nuvem' },
  { icone: ShieldCheck, rotulo: 'Segurança' },
  { icone: Sparkles, rotulo: 'IA' },
];

const CODIGO = [
  [['p', 'import'], ['t', ' { ideia } '], ['p', 'from'], ['s', " './seu-negocio'"]],
  [],
  [['p', 'const'], ['v', ' solucao'], ['t', ' = '], ['p', 'await'], ['f', ' desenvolver'], ['t', '({']],
  [['t', '  design: '], ['s', "'moderno'"], ['t', ',']],
  [['t', '  codigo: '], ['s', "'organizado'"], ['t', ',']],
  [['t', '  foco: '], ['s', "'resultado'"], ['t', ',']],
  [['t', '})']],
  [],
  [['f', 'publicar'], ['t', '(solucao)']],
];

function Orbita({ satelites, classe }) {
  return (
    <div className={`hv__orbita ${classe}`}>
      {satelites.map(({ icone: Icone, rotulo }, i) => (
        <span key={rotulo} className="hv__satelite" style={{ '--a': `${(360 / satelites.length) * i}deg` }}>
          <span className="hv__chip" title={rotulo}>
            <Icone size={18} strokeWidth={1.8} />
          </span>
        </span>
      ))}
    </div>
  );
}

export default function HeroVisual() {
  return (
    <div className="hv" aria-hidden="true">
      <div className="hv__palco">
        <div className="hv__aura" />
        <Orbita satelites={SATELITES_1} classe="hv__orbita--1" />
        <Orbita satelites={SATELITES_2} classe="hv__orbita--2" />
        <div className="hv__nucleo">
          <span className="hv__nucleo-anel" />
          <img src="/img/site/logo-as.webp" alt="" width="480" height="233" />
        </div>

        <div className="hv__janela hv__janela--codigo">
          <div className="hv__janela-topo">
            <span />
            <span />
            <span />
            <em className="mono">projeto.js</em>
          </div>
          <pre className="hv__codigo mono">
            {CODIGO.map((linha, i) => (
              <span key={i} className="hv__linha" style={{ '--l': i }}>
                <i className="hv__nl">{i + 1}</i>
                {linha.map(([tipo, txt], j) => (
                  <b key={j} className={`c-${tipo}`}>
                    {txt}
                  </b>
                ))}
                {i === CODIGO.length - 1 && <span className="hv__cursor" />}
              </span>
            ))}
          </pre>
        </div>

        <div className="hv__janela hv__janela--entrega">
          <p className="hv__entrega-titulo">Todo projeto</p>
          <ul>
            <li>
              <Check size={14} strokeWidth={2.6} /> Design responsivo
            </li>
            <li>
              <Check size={14} strokeWidth={2.6} /> Código organizado
            </li>
            <li>
              <Check size={14} strokeWidth={2.6} /> Suporte e manutenção
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
