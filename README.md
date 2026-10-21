# 📜 Garden Teleprompt

> **Stage Teleprompter, Chord Transposer & Web MIDI Controller.**
> Teleprompter profissional de palco para músicos, vocalistas e bandas: rolagem automática a 60 FPS com velocidade customizável, transpositor dinâmico de cifras (+/- 12 semitons), suporte a espelhamento óptico para vidro de teleprompter, gerenciamento de repertório (setlists) e integração com controladores de pedal via Web MIDI API (Line 6 POD HD 500, AirTurn, FCB1010).

Parte da **Garden Suite** — ferramentas de código aberto de nível Senior/Staff, 100% offline-first e sem servidor.

---

## ✨ Recursos

### 📜 Teleprompter de Palco & Leitor de Cifras
- ⚡ **Rolagem Automática Fluida (60 FPS)**: Movimento contínuo sem solavancos guiado por `requestAnimationFrame` e com velocidade em pixels/segundo ajustável.
- 🪞 **Modo Espelho (Mirror Mode)**: Inversão horizontal instantânea (`scaleX(-1)`) para uso com vidro divisor de feixe (beam-splitter glass) de teleprompters físicos.
- 👓 **Ajuste Tipográfico & Contraste de Palco**: Escala de tamanho de fonte dinâmica (16px a 60px) com contraste escuro antirreflexo para monitores de chão e tablets.
- 👁️ **Visualização Flexível**: Alterne entre modo Cifra Completa (com acordes estilizados sobrepostos) e modo Vocalista (apenas letra).

### 🎼 Transposição de Acordes em Tempo Real
- 🔄 **Motor de Transposição Harmônica (+/- 12 semitons)**:
  - Transpõe acordes com extensões complexas (`Am7`, `C#m7b5`, `Fmaj7`, `Dsus4`, `Bdim`).
  - Suporte completo a acordes invertidos com baixo alterado (slash chords: `D/F#`, `G/B`).
  - Transpõe tanto notações entre colchetes `[C]` quanto linhas tradicionais de cifras preservando o alinhamento espacial.

### 🎛️ Integração de Palco Web MIDI API
- 🎸 **Compatibilidade com Pedaleiras e Controladores**:
  - **Program Change (0xC0)**: Ao trocar de preset na sua pedaleira (ex: Line 6 POD HD 500), a música correspondente no setlist é carregada imediatamente.
  - **Control Change (0xB0)**: Use o pedal de sustain (CC 64) ou footswitches externos para Iniciar/Pausar a rolagem ou avançar para a próxima música sem tirar as mãos do instrumento.
  - Reconhecimento automático de dispositivos USB e Bluetooth MIDI (`navigator.requestMIDIAccess`).
  - Simulador virtual de pedal integrado para testes rápidos.

### 📋 Gerenciador de Setlists & Portabilidade
- 📑 **Organização de Shows**: Reordene músicas, ajuste BPM individual, notas de palco e patches de timbre.
- 💾 **100% Offline-First**: Armazenamento persistente no `localStorage` sem precisar de sinal de internet no local do evento.
- 📤 **Importação / Exportação JSON**: Salve seus setlists em arquivo para backup ou compartilhamento com os integrantes da banda.
- 📱 **PWA & APK Android Nativo**: Empacotado via Capacitor (`@capacitor/android`) para rodar em celulares e tablets Android.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19 + TypeScript
- **Estilização**: Tailwind CSS v4 + Lucide Icons
- **Music Core**: Web MIDI API & Chord Transposition Engine
- **Mobile Engine**: Capacitor 8 (Android)
- **Testes & CI**: Vitest + GitHub Actions

---

## 🚀 Como Executar

### 1. Requisitos
- Node.js 20+
- npm 10+

### 2. Instalação e Desenvolvimento Web
```bash
git clone https://github.com/FelipeGardenghiDev/garden-teleprompt.git
cd garden-teleprompt
npm install
npm run dev
```

### 3. Testes Unitários
```bash
npm test
```

### 4. Build para Produção
```bash
npm run build
```

### 5. Executar no Android (APK / Emulador)
```bash
npm run mobile:sync
npm run mobile:open # Abre o projeto no Android Studio
```

---

## 📜 Licença

MIT License © 2026 Felipe Gardenghi. Feito para palcos, estúdios e músicos independentes.
