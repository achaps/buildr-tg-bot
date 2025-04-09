# cursor.rules

# === General Configuration ===
language: typescript
framework: nextjs
database: supabase
project-type: telegram-bot

# === Project Structure Best Practices ===
folders:
  - src/bot: "Code principal du bot Telegram"
  - src/utils: "Utilitaires globaux (formatage, sécurité, etc.)"
  - src/types: "Déclarations TypeScript pour Telegram / Supabase"
  - src/services: "Interactions avec Supabase"
  - src/config: "Variables d'environnement, tokens, secrets"
  - public: "Assets publics si besoin"
  - .env.local: "Fichier d’environnement local, jamais commit"

# === Coding Conventions ===
code-style:
  use-async-await: true
  use-const: true
  enforce-return-types: true
  prefer-arrow-functions: true
  strict-null-checks: true
  import-aliases: true
  naming-conventions:
    functions: camelCase
    variables: camelCase
    classes: PascalCase
    interfaces: PascalCase
  error-handling:
    strategy: try-catch
    log: src/utils/logger.ts

# === AI Suggestions Preferences ===
ai-priorities:
  - security
  - readability
  - modularity
  - reusability
  - Supabase best practices
  - Telegram API type safety

preferred-packages:
  - telegraf
  - @supabase/supabase-js
  - zod (for schema validation)
  - dotenv
  - axios (if needed)
  - dayjs (lightweight date lib)

autocomplete-examples:
  - src/bot/handlers/start.ts
  - src/bot/handlers/points.ts
  - src/services/supabaseClient.ts
  - src/types/telegram.d.ts

# === Supabase Rules ===
supabase:
  auth:
    strategy: jwt
    rules:
      - "Restrict point updates to server-side verified Telegram ID"
      - "Rate-limit insert/update operations per IP/user"
  tables:
    - users: "Stores Telegram ID, username, totalPoints, referredBy, joinedAt"
    - actions: "Track each user action (type, timestamp, points awarded)"
  schema-validation: zod

# === Telegram Bot Structure ===
telegram:
  bot-library: telegraf
  handlers:
    - start
    - help
    - points
    - referral
    - daily
    - quiz
    - leaderboard
  middleware:
    - logger
    - rateLimiter
    - errorCatcher

# === Security Tips ===
security:
  validate-env-vars: true
  sanitize-user-input: true
  no-secret-in-frontend: true
  use-dotenv: true
  rate-limiting: per user/IP on write routes
  supabase-role-separation:
    - anon: read-only
    - service_role: secured via server-side
  token-storage: server-side only
  api-verification:
    - headers: Authorization
    - telegram-auth: signature verification for linking accounts

# === Suggested Prompts for Cursor AI ===
suggestions:
  - "Generate a secure handler for /start using Telegraf + Supabase"
  - "Write a Supabase function to increment points by action type"
  - "Create a Zod schema for validating Telegram webhook payload"
  - "Set up middleware to log and limit bot command usage"
  - "Connect Telegram ID to Supabase user profile safely"

