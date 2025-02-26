# Promptopia Creation Platform

Plataforma para geração automatizada de prompts de imagens com base em roteiros de vídeo, permitindo integração com múltiplos provedores de IA.

## 🚀 Funcionalidades
- Processa scripts de vídeo e divide em blocos configuráveis.
- Gera prompts descritivos para imagens de forma automatizada.
- Suporte a múltiplos provedores de IA (ChatGPT, Claude, Gemini, DeepSeek).
- Seleção dinâmica de provedores e configuração local de API keys.

## 🛠️ Tecnologias Utilizadas
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)  
- [TypeScript](https://www.typescriptlang.org/)  
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)  
- [Supabase](https://supabase.com/) e [Stripe](https://stripe.com/) (integrações futuras)  

## ⚙️ Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/renanduart3/promptopia-creation-platform.git
   cd promptopia-creation-platform
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as **API Keys** criando um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
   ```env
   VITE_CHATGPT_API_KEY=your_chatgpt_api_key_here
   VITE_CLAUDE_API_KEY=your_claude_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

   ⚠️ **Importante:** A única API gratuita para rodar localmente no momento é a do **Gemini** (Google AI Studio). Você pode gerar sua chave gratuitamente em:  
   👉 [Google AI Studio - API Key](https://aistudio.google.com/apikey)

4. Execute o projeto:
   ```bash
   npm run dev
   ```

## 📂 Estrutura Básica do Projeto
- `src/components/` – Componentes reutilizáveis da interface.
- `src/utils/translations.ts` – Sistema de traduções manual (Inglês e Português).
- `src/services/` – Comunicação com provedores de IA.
- `src/hooks/` – Hooks customizados.
- `src/pages/` – Páginas principais da aplicação.

## 📝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 🛡️ Licença
Este projeto está sob a licença MIT.

---
🔗 Repositório: [promptopia-creation-platform](https://github.com/renanduart3/promptopia-creation-platform)  
💻 Desenvolvido com 💙 por Renan Duarte
