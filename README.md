# AgentLab - Meu Negócio na Nuvem

O **AgentLab** é um projeto acadêmico desenvolvido para simular a publicação de uma aplicação web institucional com a temática **"Crie seu próprio Agente de IA"**.

O objetivo principal desta versão não é integrar um modelo de IA real, mas demonstrar uma arquitetura funcional envolvendo:

- Docker;
- Docker Compose;
- Nginx;
- Proxy reverso;
- Simulação de domínio;
- Git;
- Jenkins;
- Pipeline CI/CD;
- Versionamento de imagens;
- Deploy automatizado;
- Health Check.

---

# 1. Objetivo

Simular a disponibilização de uma aplicação web utilizando práticas de infraestrutura e automação.

O projeto demonstra o seguinte fluxo:

1. O desenvolvedor altera o código;
2. A alteração é enviada para o repositório Git;
3. O Jenkins identifica uma nova revisão;
4. O Jenkins executa o pipeline definido no `Jenkinsfile`;
5. As imagens Docker da aplicação e do proxy são construídas;
6. O Docker Compose realiza o deploy local;
7. Um Health Check verifica se a aplicação está acessível;
8. O usuário acessa o AgentLab pelo domínio local `agentlab.local`.

---

# 2. Requisitos obrigatórios atendidos

| Item obrigatório | Implementação no AgentLab | Evidência |
|---|---|---|
| Diagrama da arquitetura | Arquitetura Git → Jenkins → Docker → Nginx → aplicação | Diagrama deste README |
| Dockerfile | Imagem Docker própria para a aplicação | `Dockerfile` |
| docker-compose.yml | Orquestração da aplicação e proxy reverso | `docker-compose.yml` |
| Nginx ou Apache | Nginx utilizado para aplicação e proxy reverso | `nginx/nginx.conf` |
| CI/CD | Pipeline Jenkins automatizado | `Jenkinsfile` |
| Simulação de domínio | `agentlab.local` apontando para `127.0.0.1` | arquivo `hosts` |
| Site funcionando | Interface AgentLab disponível pela porta 80 | navegador |
| Evidência de deploy | Logs e estágios do Jenkins | Jenkins Build History |

---

# 3. Arquitetura da solução

```text
                         DESENVOLVIMENTO

                         Desenvolvedor
                              │
                              │ git push
                              ▼
                    ┌──────────────────┐
                    │  Repositório Git │
                    │      GitHub      │
                    └────────┬─────────┘
                             │
                             │ Poll SCM
                             ▼
                    ┌──────────────────┐
                    │     Jenkins      │
                    │  localhost:8080  │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
       Validate          Build Web         Build Proxy
                             │                  │
                             ▼                  ▼
                      agentlab:<versão>  agentlab-proxy:<versão>
                             │                  │
                             └────────┬─────────┘
                                      │
                                      ▼
                              Docker Compose
                                      │
                                      │ deploy
                                      ▼
                           ┌─────────────────────┐
                           │   Docker Engine     │
                           └──────────┬──────────┘
                                      │
                         agent-network (bridge)
                                      │
                     ┌────────────────┴────────────────┐
                     │                                 │
                     ▼                                 ▼
            ┌──────────────────┐              ┌──────────────────┐
            │ agentlab-proxy   │              │ agentlab-web     │
            │                  │              │                  │
            │ Nginx            │ proxy_pass   │ Nginx            │
 Internet → │ porta 80         │─────────────▶│ HTML / CSS / JS  │
            │ nginx.conf       │   web:80     │                  │
            └──────────────────┘              └──────────────────┘
                     ▲
                     │
                     │ 127.0.0.1
                     │
              agentlab.local
                     │
                     ▼
                 Navegador
```

---

# 4. Estrutura do projeto

```text
.
├── jenkins/
│   └── Dockerfile
│
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
│
├── site/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── version.json
│
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── docker-compose.jenkins.yml
├── Jenkinsfile
└── README.md
```

---

# 5. Componentes da arquitetura

## 5.1 Aplicação Web

O AgentLab é uma página institucional construída com:

- HTML;
- CSS;
- JavaScript.

A interface simula uma plataforma voltada à criação de agentes de IA.

Nesta versão, a criação do agente é uma demonstração de interface e não realiza chamadas para OpenAI, Azure OpenAI ou outro LLM.

Essa decisão permite manter o escopo concentrado nos requisitos da disciplina:

```text
Infraestrutura
+
Containers
+
Servidor Web
+
Proxy
+
CI/CD
```

---

# 6. Container da aplicação

O `Dockerfile` localizado na raiz do projeto gera a imagem da aplicação.

```dockerfile
FROM nginx:alpine

COPY site/ /usr/share/nginx/html/

EXPOSE 80
```

Foi utilizada a imagem:

```text
nginx:alpine
```

A escolha foi feita porque o projeto contém conteúdo web estático e não necessita de um runtime adicional como Node.js, Java ou Python.

O container resultante possui:

```text
agentlab-web
     │
     └── /usr/share/nginx/html/
             ├── index.html
             ├── style.css
             ├── script.js
             └── version.json
```

---

# 7. Proxy reverso

A aplicação não publica diretamente seu container para acesso externo.

Existe um segundo container responsável pelo ponto de entrada:

```text
agentlab-proxy
```

Ele utiliza Nginx como proxy reverso.

O arquivo:

```text
nginx/nginx.conf
```

possui a configuração:

```nginx
events {}

http {

    server {

        listen 80;

        server_name agentlab.local;

        location / {

            proxy_pass http://web:80;

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

        }
    }
}
```

O ponto principal é:

```nginx
proxy_pass http://web:80;
```

`web` corresponde ao serviço definido no Docker Compose.

O DNS interno do Docker permite que o container de proxy localize o container da aplicação pelo nome do serviço.

O fluxo fica:

```text
Navegador
     │
     ▼
agentlab.local:80
     │
     ▼
agentlab-proxy
     │
     │ proxy_pass
     ▼
http://web:80
     │
     ▼
agentlab-web
```

---

# 8. Imagem própria do proxy

O proxy também possui seu próprio Dockerfile:

```text
nginx/Dockerfile
```

Conteúdo:

```dockerfile
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

Com isso, a configuração do proxy passa a fazer parte da própria imagem:

```text
nginx:alpine
      +
 nginx.conf
      │
      ▼
Docker Build
      │
      ▼
agentlab-proxy:<versão>
```

Essa abordagem também elimina a necessidade de montar `nginx.conf` diretamente do workspace Jenkins no container da aplicação.

---

# 9. Docker Compose

O `docker-compose.yml` é responsável pelo deploy dos dois serviços.

Exemplo:

```yaml
services:

  web:

    image: agentlab:${APP_VERSION:-latest}

    container_name: agentlab-web

    restart: unless-stopped

    networks:
      - agent-network


  proxy:

    image: agentlab-proxy:${APP_VERSION:-latest}

    container_name: agentlab-proxy

    restart: unless-stopped

    ports:
      - "80:80"

    depends_on:
      - web

    networks:
      - agent-network


networks:

  agent-network:

    driver: bridge
```

Uma decisão importante é que somente:

```text
agentlab-proxy
```

publica a porta:

```text
80:80
```

O `agentlab-web` permanece disponível somente dentro da rede Docker.

Isso garante o fluxo:

```text
EXTERNO
   │
   ▼
proxy
   │
   ▼
rede Docker
   │
   ▼
web
```

---

# 10. Rede Docker

Os containers utilizam:

```text
agent-network
```

do tipo:

```text
bridge
```

Com isso:

```text
agentlab-proxy
        │
        │ agent-network
        ▼
agentlab-web
```

O serviço `web` não precisa publicar sua porta para a máquina local.

---

# 11. Domínio local

Para simular um domínio sem contratar um provedor DNS real, é utilizado:

```text
agentlab.local
```

O domínio deve ser associado ao localhost.

## Linux / macOS

Editar:

```text
/etc/hosts
```

Adicionar:

```text
127.0.0.1 agentlab.local
```

## Windows

Editar como administrador:

```text
C:\Windows\System32\drivers\etc\hosts
```

Adicionar:

```text
127.0.0.1 agentlab.local
```

O fluxo resultante é:

```text
agentlab.local
      │
      ▼
arquivo hosts
      │
      ▼
127.0.0.1
      │
      ▼
porta 80
      │
      ▼
agentlab-proxy
      │
      ▼
agentlab-web
```

Após o deploy:

```text
http://agentlab.local
```

---

# 12. Jenkins

O Jenkins é executado em um container independente e está disponível em:

```text
http://localhost:8080
```

Ele funciona como o orquestrador do processo CI/CD.

O fluxo implementado é:

```text
Git
 │
 ▼
Jenkins
 │
 ├── Version
 │
 ├── Validate
 │
 ├── Build Web
 │
 ├── Build Proxy
 │
 ├── Deploy
 │
 ├── Health Check
 │
 └── Status
```

---

# 13. Iniciando o Jenkins

Execute:

```bash
docker compose -f docker-compose.jenkins.yml up -d --build
```

Depois acesse:

```text
http://localhost:8080
```

Para obter a senha inicial:

```bash
docker exec agentlab-jenkins \
  cat /var/jenkins_home/secrets/initialAdminPassword
```

No primeiro acesso, instale os plugins sugeridos pelo Jenkins.

Os recursos relacionados a **Pipeline** e **Git** são utilizados neste projeto.

---

# 14. Configurando o Pipeline

No Jenkins:

1. Clique em **New Item**;
2. Informe:

```text
agentlab
```

3. Escolha:

```text
Pipeline
```

4. Em `Definition`, escolha:

```text
Pipeline script from SCM
```

5. SCM:

```text
Git
```

6. Informe o repositório Git;
7. Branch:

```text
main
```

8. Script Path:

```text
Jenkinsfile
```

---

# 15. Detecção de novas versões

Para o laboratório local é utilizado:

```text
Poll SCM
```

Por exemplo:

```text
H/2 * * * *
```

O Jenkins verifica periodicamente o repositório.

Quando identifica um novo commit:

```text
git push
    │
    ▼
Git
    │
    ▼
Poll SCM
    │
    ▼
nova revisão detectada
    │
    ▼
novo pipeline
```

Essa alternativa foi escolhida para evitar a necessidade de expor:

```text
localhost:8080
```

publicamente apenas para receber um webhook.

---

# 16. Pipeline CI/CD

O pipeline definido no `Jenkinsfile` possui os seguintes estágios.

## Version

Registra informações como:

```json
{
  "version": "5",
  "commit": "abcdef..."
}
```

O número é obtido do:

```text
BUILD_NUMBER
```

do Jenkins.

---

## Validate

Executa:

```bash
docker compose config
```

O objetivo é verificar a configuração do Compose antes do deploy.

---

## Build Web

Constrói:

```text
agentlab:<BUILD_NUMBER>
```

e:

```text
agentlab:latest
```

Exemplo:

```text
agentlab:5
agentlab:latest
```

---

## Build Proxy

Constrói:

```text
agentlab-proxy:<BUILD_NUMBER>
```

e:

```text
agentlab-proxy:latest
```

Exemplo:

```text
agentlab-proxy:5
agentlab-proxy:latest
```

---

## Deploy

Executa o Docker Compose utilizando o número correspondente ao build:

```bash
APP_VERSION=${BUILD_NUMBER} \
docker compose up \
    -d \
    --no-build \
    --force-recreate
```

Dessa forma, se Jenkins está executando:

```text
Build #5
```

o deploy utiliza:

```text
agentlab:5
```

e:

```text
agentlab-proxy:5
```

---

## Health Check

Após o deploy, o pipeline verifica se o proxy consegue efetivamente responder a uma requisição HTTP.

Exemplo:

```bash
docker exec agentlab-proxy \
    wget \
    --quiet \
    --spider \
    http://localhost/
```

Esse teste é importante porque valida mais do que simplesmente:

```text
container = running
```

Ele verifica o fluxo HTTP:

```text
Nginx Proxy
      │
      │ proxy_pass
      ▼
AgentLab Web
      │
      ▼
resposta HTTP
```

---

# 17. Fluxo completo de CI/CD

```text
Alteração no código
        │
        ▼
    git commit
        │
        ▼
     git push
        │
        ▼
       Git
        │
        ▼
 Jenkins Poll SCM
        │
        ▼
 Nova revisão
        │
        ▼
    VERSION
        │
        ▼
    VALIDATE
        │
        ▼
   BUILD WEB
        │
        ├──── agentlab:6
        │
        ▼
  BUILD PROXY
        │
        ├──── agentlab-proxy:6
        │
        ▼
      DEPLOY
        │
        ▼
 Docker Compose
        │
        ▼
    CONTAINERS
        │
        ▼
  HEALTH CHECK
        │
        ▼
     SUCCESS
```

---

# 18. Acompanhamento

O pipeline pode ser acompanhado em:

```text
Jenkins
  → agentlab
      → Build History
          → Console Output
```

Também é possível verificar os containers:

```bash
docker compose ps
```

Exemplo esperado:

```text
NAME               IMAGE                 STATUS
agentlab-web       agentlab:5            Up
agentlab-proxy     agentlab-proxy:5      Up
```

As imagens podem ser verificadas com:

```bash
docker images
```

Ou:

```bash
docker images agentlab
```

---

# 19. Demonstração recomendada

Para demonstrar o CI/CD durante a apresentação:

### 1. Apresente o site atual

```text
http://agentlab.local
```

Por exemplo:

```text
Build #5
```

### 2. Altere algum conteúdo

Faça uma modificação visível no HTML ou CSS.

### 3. Commit

```bash
git add .
```

```bash
git commit -m "feat: atualiza interface AgentLab"
```

### 4. Push

```bash
git push origin main
```

### 5. Jenkins

Mostre:

```text
Started by an SCM change
```

Depois:

```text
Version        ✓
Validate       ✓
Build Web      ✓
Build Proxy    ✓
Deploy         ✓
Health Check   ✓
```

### 6. Atualize o navegador

A aplicação passa a apresentar a nova versão.

Isso demonstra o ciclo completo:

```text
Código
  →
Git
  →
Jenkins
  →
Docker Build
  →
Deploy
  →
Nginx
  →
Aplicação
```

---

# 20. Evidências recomendadas para entrega

Sugere-se incluir pelo menos os seguintes prints:

## Evidência 1 - Aplicação

Navegador exibindo:

```text
http://agentlab.local
```

---

## Evidência 2 - Containers

Resultado de:

```bash
docker compose ps
```

Mostrando:

```text
agentlab-web
agentlab-proxy
```

---

## Evidência 3 - Jenkins

Pipeline com todos os estágios concluídos com sucesso.

```text
Version
Validate
Build Web
Build Proxy
Deploy
Health Check
```

---

## Evidência 4 - Deploy

`Console Output` contendo o Docker Build e a recriação dos containers.

---

## Evidência 5 - Domínio

Configuração:

```text
127.0.0.1 agentlab.local
```

e navegador acessando:

```text
http://agentlab.local
```

---

# 21. Relação com os critérios de avaliação

## Clareza e funcionalidade - 20%

Atendido por:

- arquitetura documentada;
- diagrama;
- aplicação funcional;
- componentes com responsabilidades separadas;
- fluxo CI/CD documentado.

---

## Uso correto do Docker - 20%

Atendido por:

- Dockerfile da aplicação;
- Dockerfile do proxy;
- imagens versionadas;
- Docker Compose;
- rede Docker dedicada;
- containers separados.

---

## Configuração do servidor - 20%

Atendido por:

- Nginx para servir a aplicação;
- Nginx como proxy reverso;
- configuração personalizada;
- comunicação interna utilizando `proxy_pass`.

---

## CI/CD - 20%

Atendido por um pipeline Jenkins real:

```text
SCM
 ↓
Version
 ↓
Validate
 ↓
Build
 ↓
Deploy
 ↓
Health Check
```

Além disso, o pipeline está definido como código por meio do:

```text
Jenkinsfile
```

---

## Apresentação e justificativas - 20%

Atendido por:

- README técnico;
- descrição das escolhas arquiteturais;
- evidências do pipeline;
- domínio simulado;
- demonstração do deploy;
- histórico das decisões.

---

# 22. Histórico de decisões técnicas

Esta seção registra as principais decisões tomadas durante a evolução do projeto e os motivos de cada alteração.

## Decisão 01 - Site institucional com temática de IA

### Decisão

Criar uma aplicação fictícia denominada:

```text
AgentLab
```

com a proposta:

> Crie seu próprio Agente de IA.

### Motivo

A temática permite uma interface moderna e mantém o foco principal da atividade em infraestrutura e arquitetura.

Um modelo de IA real não foi incluído nesta primeira versão porque isso adicionaria APIs, credenciais, custos e componentes que não são necessários para atender aos requisitos da disciplina.

---

## Decisão 02 - Nginx como servidor web

### Decisão

Utilizar:

```text
nginx:alpine
```

para servir HTML, CSS e JavaScript.

### Motivo

Como a aplicação é estática, não há necessidade de executar Node.js, Java ou outro runtime.

O Nginx atende diretamente à necessidade da solução e também permite demonstrar o requisito relacionado ao servidor web.

---

## Decisão 03 - Separação entre aplicação e proxy

### Inicialmente

Seria possível utilizar somente:

```text
Nginx
   │
   └── site
```

### Decisão final

Separar:

```text
agentlab-proxy
```

e:

```text
agentlab-web
```

### Motivo

Essa estrutura permite demonstrar explicitamente um **proxy reverso**, tornando mais claro o papel de cada componente.

---

## Decisão 04 - GitHub Actions substituído por Jenkins

### Primeira proposta

```text
GitHub
   ↓
GitHub Actions
   ↓
Docker
```

### Evolução

```text
Git
 ↓
Jenkins
 ↓
Docker
 ↓
Deploy local
```

### Motivo

O objetivo passou a incluir a demonstração de um servidor CI/CD local capaz de:

- detectar novas versões;
- executar builds;
- criar imagens;
- realizar o deploy no Docker local;
- executar teste pós-deploy.

O Jenkins tornou esse fluxo mais visível durante a apresentação.

---

## Decisão 05 - Poll SCM em vez de Webhook

### Alternativa considerada

```text
GitHub
   │
   │ webhook
   ▼
Jenkins
```

### Problema

O Jenkins está disponível somente em:

```text
localhost:8080
```

O GitHub não consegue entregar diretamente um webhook para `localhost`.

Seria necessário adicionar um componente como túnel ou disponibilização externa.

### Decisão

Utilizar:

```text
Poll SCM
```

### Motivo

Mantém o laboratório totalmente local e permite que o Jenkins detecte novas revisões sem adicionar infraestrutura externa.

---

## Decisão 06 - Versionamento por BUILD_NUMBER

### Decisão

Cada execução gera imagens como:

```text
agentlab:5
agentlab-proxy:5
```

Além de:

```text
agentlab:latest
agentlab-proxy:latest
```

### Motivo

Isso proporciona:

- rastreabilidade;
- identificação da versão implantada;
- demonstração clara de uma nova entrega;
- base para implementação futura de rollback.

---

## Decisão 07 - Jenkins utilizando Docker Engine do host

### Decisão

Montar:

```text
/var/run/docker.sock
```

no container Jenkins.

### Motivo

Permite que o Docker CLI executado dentro do Jenkins controle o Docker Engine da máquina local.

Arquitetura:

```text
Jenkins Container
      │
      │ Docker CLI
      ▼
docker.sock
      │
      ▼
Docker Engine host
      │
      ├── agentlab-web
      └── agentlab-proxy
```

### Restrição

Essa abordagem concede privilégios elevados ao Jenkins.

Por isso, é utilizada apenas para fins de **laboratório acadêmico local**.

Em um cenário produtivo, seriam recomendados agentes Jenkins isolados e controles de acesso mais restritivos.

---

## Decisão 08 - Instalação do Docker Compose no Jenkins

### Problema identificado

Durante a construção da imagem Jenkins, o pacote:

```text
docker-compose-plugin
```

não estava disponível diretamente nos repositórios configurados na imagem utilizada.

### Decisão

Instalar o Docker Compose CLI Plugin explicitamente no ambiente Jenkins.

### Resultado

O pipeline passou a executar corretamente comandos como:

```bash
docker compose config
```

e:

```bash
docker compose up
```

---

## Decisão 09 - Empacotar nginx.conf dentro da imagem do proxy

### Implementação inicial

O `docker-compose.yml` utilizava:

```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
```

### Problema encontrado

O checkout ocorre dentro do container Jenkins:

```text
/var/jenkins_home/workspace/agentlab
```

Entretanto, os containers da aplicação são criados pelo Docker Engine do host por meio do:

```text
/var/run/docker.sock
```

O Docker do host tentou localizar:

```text
/var/jenkins_home/workspace/agentlab/nginx/nginx.conf
```

em seu próprio filesystem.

Isso provocou erro de bind mount durante o deploy.

### Decisão

Criar:

```text
nginx/Dockerfile
```

e incorporar:

```text
nginx.conf
```

diretamente na imagem.

```dockerfile
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
```

### Resultado

Antes:

```text
nginx:alpine
     +
bind mount do nginx.conf
```

Depois:

```text
nginx:alpine
     +
nginx.conf
     │
     ▼
Docker Build
     │
     ▼
agentlab-proxy:<BUILD_NUMBER>
```

### Benefícios

- elimina o problema de filesystem entre Jenkins e Docker host;
- torna o proxy imutável;
- versiona a configuração junto com a imagem;
- facilita rastreabilidade;
- permite rollback;
- melhora a demonstração do requisito de proxy reverso.

---

## Decisão 10 - Health Check após o deploy

### Decisão

Adicionar um estágio específico:

```text
Health Check
```

### Motivo

Um container estar com status:

```text
Up
```

não significa necessariamente que a aplicação está funcional.

O pipeline realiza uma requisição HTTP após o deploy.

Assim conseguimos diferenciar:

```text
Container iniciado
```

de:

```text
Aplicação efetivamente respondendo
```

O deploy só deve ser considerado bem-sucedido quando o teste HTTP também funcionar.

---

# 23. Melhorias futuras

A arquitetura atual permite evoluções como:

- rollback automático;
- healthcheck nativo no Docker Compose;
- GitHub Webhook em substituição ao Poll SCM;
- Docker Registry privado;
- publicação no GitHub Container Registry;
- HTTPS;
- certificados TLS;
- SonarQube;
- testes automatizados;
- Trivy para análise da imagem Docker;
- gerenciamento de secrets pelo Jenkins Credentials;
- Blue/Green Deployment;
- integração real com Azure OpenAI ou outra API de IA.

Uma evolução natural seria:

```text
Git
 ↓
Jenkins
 ↓
Tests
 ↓
SonarQube
 ↓
Docker Build
 ↓
Trivy
 ↓
Container Registry
 ↓
Deploy
 ↓
Health Check
```

---

# 24. Conclusão

O AgentLab demonstra uma arquitetura simples, mas funcional, para publicação automatizada de uma aplicação web.

A solução evoluiu de um site estático containerizado para um pequeno ambiente de entrega contínua:

```text
Código
   ↓
Git
   ↓
Jenkins
   ↓
Docker Build
   ↓
Imagens versionadas
   ↓
Docker Compose
   ↓
Nginx Reverse Proxy
   ↓
AgentLab
   ↓
Health Check
```

As escolhas buscaram manter o ambiente **reproduzível, demonstrável localmente e aderente aos requisitos obrigatórios**, evitando componentes externos que não agregariam diretamente aos objetivos da atividade.

Ao mesmo tempo, decisões como o uso do `Jenkinsfile`, imagens versionadas, proxy reverso imutável e Health Check aproximam a simulação de práticas reais utilizadas em processos de CI/CD.