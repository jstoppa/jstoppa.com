---
author: Juan Stoppa
title: "When context is the moat: running OpenClaw securely with persistent memory"
summary: Notes on running OpenClaw in docker with special focus on persistent context, memory and data
date: 2026-02-02
description: Notes on running OpenClaw in docker with special focus on persistent context, memory and data ownership.
draft: false
math: false
tags: ['openclaw', 'clawdbot', 'moltbot', 'agent-context']
cover:
    image: 'posts/how-to-run-openclaw-securely-in-docker-with-persistent-storage/openclaw-docker-cover.png'
    caption: "When context is the product: running OpenClaw securely with persistent memory"
    hidden: true
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: "When context is the product: running OpenClaw securely with persistent memory"
    description: Notes on running OpenClaw in docker with special focus on persistent context, memory and data ownership.
---

Context engineering is one of the hardest problems to solve when working with AI agents. It is no longer just about how capable the model is but about how you manage the growing amount of context generated through interaction, and how you ensure agents remember what actually matters rather than losing important details over time.

I had heard really good things about OpenClaw’s memory management so I decided to give it a go. [OpenClaw](https://openclaw.ai/) (formerly known as [ClawdBot or Moltbot](https://www.forbes.com/sites/kateoflahertyuk/2026/02/06/what-is-openclaw-formerly-moltbot--everything-you-need-to-know/)) has been getting attention for how it handles [context and memory](https://manthanguptaa.in/posts/clawdbot_memory/), which made it a good candidate to explore this space more hands-on.

OpenClaw runs on your own infrastructure, stores context on disk and uses SQLite together with vector memory search to retrieve relevant context (still exploring how this last bit works in practice). The data remains yours and memory is built incrementally as you interact with the agent, rather than being hidden behind a managed service.

Once context becomes central, where that context lives becomes just as important. If memory is what gives an agent its value over time, then losing access to it breaks the whole experience. That pushed me to think about context not only in terms of storage and security but also in terms of portability and reuse.

## Why context portability is so important

Once context becomes valuable, owning it is not optional. Your AI agent builds knowledge over time. It learns your preferences, remembers past conversations and accumulates information that directly affects how useful it is. 

Losing that context means starting again from zero.

If that context lives on a single machine, ownership is limited. A broken laptop, a switch to a desktop or the need to work from another location is enough to break the experience. The agent still exists but the memory that made it useful does not.

This is where portability becomes critical. Context should not be tied to one device or one environment. It should be something you can move, copy and run elsewhere without friction.

By running OpenClaw in Docker with all data stored in a single folder, the agent becomes portable by design. I can move the entire setup to another machine in minutes. Copy the folder, run Docker and the agent starts with the same context, memory, and configuration as before.

This is not just about backup. It is about not being tied to a single piece of hardware. I want to be able to run my AI agent wherever I need it, whether that is my laptop, a desktop machine, or a VPS, without losing context or starting again.

Looking ahead, this also hints at where things may be going. It is easy to imagine services that run OpenClaw as a hosted option while still allowing users to keep ownership of their data. Whether OpenClaw itself enables this remains to be seen but the direction feels natural, particularly in enterprise environments where data ownership and control are non negotiable.

The Docker setup makes this simple. Everything lives in the data/ directory. Move that folder and you move the agent.

## The Setup

Here's the complete structure I created as a docker compose, this setup will allow you to start OpenClaw very quickly and securely. It is intended to be stored in a private Git repository or if you want to be even  more secure, in a on prem or cloud secure storage service.

> ℹ️ **NOTE**  
> You can get the whole setup [here](https://github.com/jstoppa/openclaw_setup) but I still recommend you to follow the steps below to understand the process and the security considerations.

> 🚨 **IMPORTANT**  
> I have included all the configuration files I could locate so far (.env, openclaw.json, auth-profiles.json, etc) in the .gitignore file.  
> Please review them carefully and make sure the repository remains private at all times.  s  
> **Do not make this repository public.**


```
openclaw_setup/
├── docker-compose.yml      # Container orchestration
├── .env                    # Environment variables (secrets - NEVER commit!)
├── .env.example            # Template for .env (safe to commit)
├── .gitignore              # Protect sensitive files like .env, openclaw.json, auth-profiles.json, etc
├── data/                   # All OpenClaw data (volume mount)
│   ├── openclaw.json       # Configuration (contains tokens - gitignored)
│   ├── memory/             # SQLite database for semantic search
│   ├── agents/             # Session transcripts
│   └── workspace/          # Memory files and daily logs
└── scripts/                # Helper scripts
    ├── setup.sh
    └── cli.sh
```

## Step 1: Create the Docker Compose File

Create the `docker-compose.yml` file:

```yaml
services:
  # Service for running OpenClaw CLI commands
  openclaw-cli:
    image: ${OPENCLAW_IMAGE:-openclaw:local}
    build:
      context: https://github.com/openclaw/openclaw.git#main
      dockerfile: Dockerfile
    container_name: openclaw-cli
    environment:
      - HOME=/home/node
      - TERM=xterm-256color
      - BROWSER=echo
    volumes:
      - ./data:/home/node/.openclaw
    stdin_open: true
    tty: true
    init: true
    entrypoint: ["node", "dist/index.js"]
    profiles:
      - cli

  # Service for running the web gateway
  openclaw-gateway:
    image: ${OPENCLAW_IMAGE:-openclaw:local}
    build:
      context: https://github.com/openclaw/openclaw.git#main
      dockerfile: Dockerfile
    container_name: openclaw-gateway
    environment:
      - HOME=/home/node
      - TERM=xterm-256color
      - OPENCLAW_GATEWAY_TOKEN=${OPENCLAW_GATEWAY_TOKEN}
    volumes:
      - ./data:/home/node/.openclaw
    ports:
      - "${OPENCLAW_GATEWAY_PORT:-18789}:18789"
      - "${OPENCLAW_BRIDGE_PORT:-18790}:18790"
    command: >
      node dist/index.js gateway
      --bind ${OPENCLAW_GATEWAY_BIND:-lan}
      --port 18789
      --allow-unconfigured
    restart: unless-stopped
    init: true
```

**Security notes:**
- The container runs as `node` user (UID 1000), not root
- Volume mount is limited to `./data` only, the container can't access your entire filesystem
- Ports are only exposed to your local network by default

The key thing here is that all context stays in the `./data` folder. That's what makes this portable.

## Step 2: Create the Environment File (Secrets Management)

> 🚨 **IMPORTANT**   
> **This is critical for security.** Never hardcode tokens in your docker-compose.yml.

Create `.env.example` as a template (safe to commit):

```bash
# Docker image configuration
OPENCLAW_IMAGE=openclaw:local

# Gateway configuration
OPENCLAW_GATEWAY_PORT=18789
OPENCLAW_BRIDGE_PORT=18790
OPENCLAW_GATEWAY_BIND=lan

# Authentication token for web UI (generate with: openssl rand -hex 32)
OPENCLAW_GATEWAY_TOKEN=your_secure_token_here
```

Then create your actual `.env` file with a strong token:

```bash
cp .env.example .env

# Generate a cryptographically secure token (32 bytes = 64 hex characters)
openssl rand -hex 32
# Copy the output and paste it as OPENCLAW_GATEWAY_TOKEN in .env
```
> 🚨 **IMPORTANT**   
> Use a strong, randomly generated token. Never use simple passwords or reuse tokens from other services.

## Step 3: Create a Comprehensive .gitignore

This is your first line of defence against accidentally leaking secrets, in any case your repo should alwayys be private but it's better to never have any key inside the repo:

```gitignore
# Environment files (contains secrets)
.env
data/.env

# OpenClaw sensitive config (contains tokens)
data/openclaw.json
data/openclaw.json.bak

# Device identity (contains private keys)
data/identity/

# Credentials and pairing (per-setup, contains secrets)
data/credentials/
data/devices/
data/agents/**/auth-profiles.json
data/agents/**/agent/

# Telegram state (per-setup)
data/telegram/

# Runtime files
data/update-check.json
data/completions/
data/canvas/
data/cron/

# Docker
.docker/

# Logs
*.log
logs/

# Temporary files
tmp/
*.tmp

# OS files
**/.DS_Store
Thumbs.db

# Editor files
*.swp
*.swo
*~
.idea/
.vscode/

# Backup files
*.bak
*.backup
```

## Step 4: Build and Start

```bash
# Create data directory
mkdir -p data

# Build the Docker image (takes 5-10 minutes first time)
docker compose build

# Run the onboarding wizard
docker compose run --rm openclaw-cli onboard

# Start the gateway
docker compose up -d openclaw-gateway
```

The onboarding wizard will ask you to:
1. **Acknowledge security warnings** - read these carefully!
![Security warnings](/posts/how-to-run-openclaw-securely-in-docker-with-persistent-storage/openclaw-onboarding-acknowledge.png)
2. It will ask you if you want to do a QuickStart or manual, I would recommend a quickstart as it will guide you through the process of setting up your LLM credentials and messaging channels.
3. You'll need to configure your LLM (either using API key or OAuth when supported)
4. Set up the communication channel you want to use (Telegram, WhatsApp, etc), I'll show below how to do it for Telegram.


```

Then restart: `docker compose restart openclaw-gateway`

**Note**: This setting is named "dangerously" for a reason - it disables device authentication for the Control UI. This is acceptable when running locally, but if you ever expose the gateway to the internet, you should implement proper device pairing instead.

## Step 6: Secure Telegram Configuration

This is where many people get security wrong.

By default, if you just enable Telegram without restrictions, **anyone who finds your bot can chat with it**. I learned this the hard way during testing.

### How Telegram Bot Connectivity Works

First, understand what's happening:
- Your container makes **outbound HTTPS requests** to Telegram's API (polling)
- No inbound ports need to be open to the internet for Telegram
- Telegram routes messages to your bot based on the bot token

### The Secure Configuration

Create a Telegram bot via [@BotFather](https://t.me/BotFather), then edit `data/openclaw.json`:

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_BOT_TOKEN_HERE",
      "dmPolicy": "allowlist",
      "allowFrom": ["YOUR_TELEGRAM_USER_ID"]
    }
  }
}
```

**Critical settings explained:**

| Setting | Secure Value | Why |
|---------|--------------|-----|
| `dmPolicy` | `"allowlist"` | Only users in the list can chat (not `"open"`!) |
| `allowFrom` | `["YOUR_ID"]` | Whitelist of allowed Telegram user IDs |

To find your Telegram user ID, message [@userinfobot](https://t.me/userinfobot).

**Never use `"allowFrom": ["*"]`** in production - this allows anyone to chat with your bot.

Restart the gateway after making changes:

```bash
docker compose restart openclaw-gateway
```

## Security Hardening Checklist

Once everything is running, go through these checks:

### 1. Network Binding

Check your `data/openclaw.json`:

```json
{
  "gateway": {
    "bind": "lan"
  }
}
```

Options from most to least secure:
- `"loopback"` - Only accessible from localhost (most secure)
- `"lan"` - Accessible from your local network
- `"public"` - Accessible from anywhere (dangerous!)

### 2. Token Strength

Verify your gateway token is strong:
```bash
# Should be 64 characters (32 bytes hex)
grep OPENCLAW_GATEWAY_TOKEN .env | wc -c
```

### 3. File Permissions

Ensure sensitive files aren't world-readable:
```bash
chmod 600 .env
chmod 600 data/openclaw.json
chmod 700 data/credentials/
```

### 4. Git Safety

Verify secrets aren't tracked:
```bash
git status --ignored
# Confirm .env and data/openclaw.json appear in ignored files
```

### 5. Run Security Audit

OpenClaw has a built-in security auditor:
```bash
docker compose run --rm openclaw-cli security audit --deep
```

## Understanding the Data Structure

This is the key part for portability. All your data is stored in the `data/` directory:

| Location | Contains | Sensitivity |
|----------|----------|-------------|
| `data/openclaw.json` | API keys, bot tokens | **HIGH** - gitignored |
| `data/credentials/` | OAuth tokens | **HIGH** - gitignored |
| `data/memory/*.sqlite` | Conversation embeddings | Medium |
| `data/agents/main/sessions/*.jsonl` | Full conversation history | Medium |
| `data/workspace/memory/*.md` | Daily memory summaries | Medium |

### How Memory Works

This is what makes OpenClaw interesting. It has three layers of memory:

1. **Session logs** (`.jsonl` files): Complete conversation history
2. **Daily summaries** (`.md` files): Human-readable daily notes
3. **Vector index** (SQLite): Embeddings for semantic search

When you ask "what did we discuss last week?", OpenClaw:
- Converts your query to a vector embedding
- Searches the SQLite database for similar vectors
- Returns relevant past conversations

You can manually search memory via CLI:

```bash
docker compose run --rm openclaw-cli memory search "your query"
```

## Daily Usage

### Access the Web UI

Open `http://localhost:18789/` in your browser and enter your gateway token.

### Run CLI Commands

```bash
# Get help
docker compose run --rm openclaw-cli --help

# Search memory
docker compose run --rm openclaw-cli memory search "topic"

# Run security audit
docker compose run --rm openclaw-cli security audit --deep

# Check system health
docker compose run --rm openclaw-cli doctor
```

### Manage the Gateway

```bash
# View logs (check for suspicious activity)
docker compose logs -f openclaw-gateway

# Restart
docker compose restart openclaw-gateway

# Stop
docker compose down

# Update to latest version (includes security patches)
docker compose build --no-cache
docker compose up -d openclaw-gateway
```

## Backup Strategy

Since all data lives in the `data/` directory, backup is straightforward. This is also how you move your assistant to another machine.

```bash
# Create encrypted backup
tar -czf - data/ | openssl enc -aes-256-cbc -salt -out openclaw-backup-$(date +%Y%m%d).tar.gz.enc

# To restore (will prompt for password)
openssl enc -d -aes-256-cbc -in openclaw-backup-*.tar.gz.enc | tar -xzf -
```

For unencrypted backup (only if stored securely):
```bash
tar -czf openclaw-backup-$(date +%Y%m%d).tar.gz data/
```

**Remember**: Your backup contains API keys and conversation history. Store it securely.

## Common Mistakes to Avoid

A few things I've seen people get wrong:

1. **Don't use `"dmPolicy": "open"` with `"allowFrom": ["*"]`** - Anyone can chat with your bot
2. **Don't commit `.env` or `openclaw.json`** - Your tokens will be exposed
3. **Don't use `"bind": "public"`** unless behind a reverse proxy with auth
4. **Don't share your bot token** - Anyone with it can impersonate your bot
5. **Don't run as root** - The container already runs as `node` user, don't change this
6. **Don't expose ports to the internet** without proper authentication

## Troubleshooting

### Gateway won't start
```bash
docker compose logs openclaw-gateway
```

### Data not persisting
```bash
# Check volume mount
docker compose exec openclaw-gateway ls -la /home/node/.openclaw

# Fix permissions if needed (node user is UID 1000)
sudo chown -R 1000:1000 ./data/
```

### CLI can't connect to gateway
The CLI runs in a separate container, so it can't reach the gateway via localhost. For CLI commands that need the gateway, use:
```bash
docker compose exec openclaw-gateway node dist/index.js <command>
```

### Suspicious activity in logs
If you see unexpected connections or messages:
1. Check `docker compose logs openclaw-gateway` for unknown IPs
2. Verify your `allowFrom` list is correct
3. Rotate your gateway token immediately
4. Consider changing your Telegram bot token via @BotFather

## Summary

This setup gives you a portable and secure OpenClaw instance running in Docker with:
- **Full portability**: Copy the `data/` folder and move your assistant anywhere
- **Context preservation**: Memory, conversations and configuration all in one place
- **Isolated container** that can't access your host filesystem
- **Strong authentication** via cryptographic tokens
- **Restricted Telegram access** limited to your user ID only
- **Local-only network binding** preventing external access
- **Gitignored secrets** that won't accidentally leak

The real value here is not being tied to a single machine. Your AI assistant's context is yours. You should be able to take it with you.

I've been running this setup for a few weeks now and it works well. I can switch between my laptop and desktop without losing any context.

Security is still important. Regularly:
- Run `openclaw security audit --deep`
- Check logs for suspicious activity
- Update to the latest version for security patches
- Review your `allowFrom` lists

I hope this guide helps you get started with OpenClaw!

If you liked this post, you can follow me on [𝕏](https://x.com/juanstoppa) for more content like this.
