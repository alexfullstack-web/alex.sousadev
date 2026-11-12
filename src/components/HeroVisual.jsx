// Composição do topo da página inicial: a frase "transformamos ideias em soluções digitais"
// em imagem. Três camadas (o rascunho da ideia, o código e o produto pronto) ligadas por uma
// trilha de circuito por onde passa um pulso de luz. SVG puro, leve, sem dados inventados.
// Com "reduzir movimento", fica parada.
export default function HeroVisual() {
  return (
    <div className="hv" aria-hidden="true">
      <svg className="hv__svg" viewBox="0 0 560 520" role="presentation" focusable="false">
        <defs>
          <linearGradient id="hv-vidro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#13284c" stopOpacity="0.92" />
            <stop offset="1" stopColor="#081428" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id="hv-borda" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5cc8ff" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#94aad2" stopOpacity="0.16" />
            <stop offset="1" stopColor="#1f6feb" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="hv-acao" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1f6feb" />
            <stop offset="1" stopColor="#5cc8ff" />
          </linearGradient>
          <radialGradient id="hv-brilho" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#5cc8ff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#5cc8ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Trilha de circuito: ideia → código → produto */}
        <path className="hv__trilha" d="M150 150 H205 L235 180 V250 L262 277 H300" />
        <path className="hv__trilha" d="M402 318 V352 L376 378 H342" />
        <path className="hv__pulso" d="M150 150 H205 L235 180 V250 L262 277 H300" pathLength="100" />
        <path className="hv__pulso hv__pulso--2" d="M402 318 V352 L376 378 H342" pathLength="100" />
        <circle className="hv__no" cx="150" cy="150" r="4" />
        <circle className="hv__no" cx="300" cy="277" r="4" />
        <circle className="hv__no" cx="402" cy="318" r="4" />
        <circle className="hv__no" cx="342" cy="378" r="4" />

        {/* 1. Ideia: rascunho */}
        <g className="hv__camada hv__camada--1">
          <rect x="20" y="40" width="200" height="150" rx="14" fill="#0a1426" stroke="url(#hv-borda)" />
          <g className="hv__rascunho">
            <rect x="40" y="62" width="160" height="22" rx="5" />
            <rect x="40" y="96" width="76" height="70" rx="6" />
            <rect x="126" y="96" width="74" height="30" rx="6" />
            <rect x="126" y="136" width="74" height="30" rx="6" />
          </g>
          <text className="hv__rotulo" x="40" y="214">
            Ideia
          </text>
        </g>

        {/* 2. Código */}
        <g className="hv__camada hv__camada--2">
          <rect x="190" y="200" width="250" height="170" rx="14" fill="url(#hv-vidro)" stroke="url(#hv-borda)" />
          <circle cx="210" cy="220" r="4" fill="#ff7a7a" fillOpacity="0.7" />
          <circle cx="224" cy="220" r="4" fill="#f5c451" fillOpacity="0.7" />
          <circle cx="238" cy="220" r="4" fill="#3ccf91" fillOpacity="0.7" />
          <g className="hv__codigo">
            <rect x="210" y="242" width="54" height="7" rx="3.5" fill="#5cc8ff" />
            <rect x="270" y="242" width="88" height="7" rx="3.5" fill="#c8d1dd" />
            <rect x="226" y="260" width="40" height="7" rx="3.5" fill="#1f6feb" />
            <rect x="272" y="260" width="120" height="7" rx="3.5" fill="#94aad2" />
            <rect x="226" y="278" width="70" height="7" rx="3.5" fill="#c8d1dd" />
            <rect x="302" y="278" width="46" height="7" rx="3.5" fill="#5cc8ff" />
            <rect x="242" y="296" width="96" height="7" rx="3.5" fill="#94aad2" />
            <rect x="242" y="314" width="58" height="7" rx="3.5" fill="#1f6feb" />
            <rect x="306" y="314" width="70" height="7" rx="3.5" fill="#c8d1dd" />
            <rect x="226" y="332" width="34" height="7" rx="3.5" fill="#5cc8ff" />
            <rect x="210" y="350" width="22" height="7" rx="3.5" fill="#c8d1dd" />
          </g>
          <rect className="hv__cursor" x="236" y="350" width="2" height="9" fill="#5cc8ff" />
          <text className="hv__rotulo" x="210" y="394">
            Código
          </text>
        </g>

        {/* 3. Produto pronto */}
        <g className="hv__camada hv__camada--3">
          <rect x="300" y="300" width="240" height="200" rx="16" fill="url(#hv-vidro)" stroke="url(#hv-borda)" />
          <rect x="300" y="300" width="240" height="34" rx="16" fill="#0d1d39" />
          <rect x="300" y="318" width="240" height="16" fill="#0d1d39" />
          <rect x="318" y="313" width="40" height="8" rx="4" fill="#c8d1dd" fillOpacity="0.85" />
          <rect x="452" y="311" width="70" height="12" rx="6" fill="url(#hv-acao)" />
          <rect x="318" y="350" width="126" height="12" rx="6" fill="#eef3fa" fillOpacity="0.9" />
          <rect x="318" y="370" width="96" height="8" rx="4" fill="#94aad2" fillOpacity="0.7" />
          <rect className="hv__botao" x="318" y="390" width="70" height="20" rx="10" fill="url(#hv-acao)" />
          <rect x="318" y="424" width="62" height="56" rx="10" fill="#132a51" />
          <rect x="389" y="424" width="62" height="56" rx="10" fill="#132a51" />
          <rect x="460" y="424" width="62" height="56" rx="10" fill="#132a51" />
          <path d="M330 466 l10 -10 l10 6 l14 -16" fill="none" stroke="#5cc8ff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="420" cy="446" r="9" fill="none" stroke="#3ccf91" strokeWidth="2" />
          <rect x="472" y="440" width="38" height="6" rx="3" fill="#c8d1dd" fillOpacity="0.6" />
          <rect x="472" y="452" width="26" height="6" rx="3" fill="#c8d1dd" fillOpacity="0.4" />
          <circle cx="478" cy="378" r="44" fill="url(#hv-brilho)" opacity="0.18" />
        </g>
        <text className="hv__rotulo hv__rotulo--produto" x="540" y="516" textAnchor="end">
          Produto
        </text>
      </svg>
    </div>
  );
}
