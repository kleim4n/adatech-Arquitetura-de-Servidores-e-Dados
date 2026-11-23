# Projeto 1: Meu Negócio na Nuvem

Objetivo: Simular a publicação de um site institucional usando Docker, servidor web, CI/CD e domínio.

Descrição:

Os alunos devem simular a publicação de um site institucional simples para um pequeno negócio (ex: loja de doces, oficina, consultório), com foco em:

- Criar um servidor web usando Nginx ou Apache em Docker
- Configurar o Nginx como proxy reverso
- Escolher um provedor de domínio e simular sua configuração (pode usar o hosts)
- Criar um pipeline CI/CD básico (ex: push → build da imagem docker)

Entregáveis:

- Diagrama da arquitetura (monolítica ou microserviços simples)
- Dockerfile e docker-compose
- Print do funcionamento via localhost ou ngrok
- Descrição das decisões (servidor, domínio, CI/CD, etc.)


## Itens Obrigatórios:
| Item                          | Descrição                                             | Entregue? |
|-------------------------------|-------------------------------------------------------|------------------|
| Diagrama da Arquitetura       | Representa servidor, app, domínio e CI/CD            |                  |
| Dockerfile                    | Criação da imagem                                    |                  |
| docker-compose.yml            | Orquestração da aplicação                            |                  |
| Nginx ou Apache configurado   | Proxy reverso ou server ativo                        |                  |
| CI/CD Simulado ou configurado | Ex: GitHub Actions, GitLab CI ou explicação teórica |                  |
| Simulação de domínio          | Uso de `/etc/hosts` ou apontamento DNS              |                  |
| Print do site no navegador    | Conteúdo do projeto funcionando localmente           |                  |

## Critérios de Avaliação:
| Critério                         | Peso | Nível Básico (0-2)               | Intermediário (3-4)                 | Avançado (5)                         |
|----------------------------------|------|----------------------------------|-------------------------------------|-------------------------------------|
| Clareza e funcionalidade         | 20%  | Diagrama ausente ou confuso      | Diagrama parcialmente funcional     | Diagrama claro, completo e funcional|
| Uso correto do Docker            | 20%  | Dockerfile básico com erros      | Docker funcional, mas limitado      | Dockerfile e Compose bem estruturados|
| Configuração do servidor         | 20%  | Configuração padrão ou errada    | Funciona com ajustes                | Servidor personalizado e funcional  |
| CI/CD (simulado ou real)         | 20%  | Inexistente ou mal explicado     | Processo funcional mas simples      | CI/CD funcional com boas práticas   |
| Apresentação geral e justificativas | 20% | Explicações vagas                | Boa argumentação das decisões       | Justificativas claras e bem articuladas |