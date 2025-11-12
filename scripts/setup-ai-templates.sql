-- Inserir template padrão para geração de HTML
INSERT INTO "prompt_templates" (
  id, 
  name, 
  key, 
  prompt, 
  description, 
  category, 
  variables, 
  "createdById"
) VALUES (
  'clm0000000000000000000001',
  'Geração de HTML Completo',
  'html_generation',
  'Crie um site HTML completo e responsivo baseado nas seguintes informações:

**Nome do Site:** {{siteName}}
**Tipo de Negócio:** {{businessType}}
**Descrição:** {{description}}
**Público-Alvo:** {{targetAudience}}
**Principais Serviços:** {{mainServices}}
**Informações de Contato:** {{contactInfo}}
**Cores da Marca:** {{brandColors}}
**Estilo Desejado:** {{style}}
**Requisitos Adicionais:** {{additionalRequirements}}

INSTRUÇÕES:
1. Crie um HTML completo com DOCTYPE, head e body
2. Inclua CSS interno responsivo e moderno
3. Use as cores da marca fornecidas
4. Inclua seções: header, hero, sobre, serviços, contato, footer
5. Torne o design responsivo para mobile, tablet e desktop
6. Use JavaScript vanilla se necessário para interações básicas
7. Inclua meta tags para SEO
8. Use fontes web (Google Fonts)
9. Otimize para performance e acessibilidade
10. O resultado deve ser um arquivo HTML único e completo

Retorne APENAS o código HTML completo, sem explicações adicionais.',
  'Template para geração automática de sites HTML completos pela IA',
  'html',
  '["siteName", "businessType", "description", "targetAudience", "mainServices", "contactInfo", "brandColors", "style", "additionalRequirements"]'::json,
  'admin_user_id'  -- Você precisará substituir por um ID válido de admin
);

-- Inserir configuração padrão da IA (Groq)
INSERT INTO "ai_configs" (
  id,
  provider,
  "apiKey",
  model,
  "maxTokens",
  temperature,
  description,
  "createdById"
) VALUES (
  'clm0000000000000000000002',
  'groq',
  'sua_api_key_groq_aqui', -- Substitua pela sua API key real
  'llama3-70b-8192',
  4000,
  0.7,
  'Configuração padrão para Groq Llama3-70B',
  'admin_user_id'  -- Você precisará substituir por um ID válido de admin
);