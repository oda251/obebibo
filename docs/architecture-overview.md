# Obebibo System Architecture（Rails 単一構成）

## High-Level Architecture

```mermaid
graph TB
    subgraph WebLayer
        UI[ERB/HTML View]
        STATIC[Static Assets]
    end
    subgraph ApplicationLayer
        CONTROLLERS[Controllers]
        COMPONENTS[View Components]
        SERVICES[Service Objects]
        HELPERS[Helpers]
        MAILERS[Mailers]
        JOBS[Background Jobs]
    end
    subgraph DataLayer
        MODELS[ActiveRecord Models]
        DB[(PostgreSQL Database)]
        REDIS[(Redis Cache)]
    end
    subgraph AdminLayer
        ADMIN_UI[Admin ERB Views]
        ADMIN_CONTROLLERS[Admin Controllers]
        ADMIN_COMPONENTS[Admin Components]
    end
    UI --> CONTROLLERS
    STATIC --> UI
    CONTROLLERS --> SERVICES
    CONTROLLERS --> HELPERS
    CONTROLLERS --> COMPONENTS
    CONTROLLERS --> MODELS
    CONTROLLERS --> MAILERS
    CONTROLLERS --> JOBS
    SERVICES --> MODELS
    MODELS --> DB
    JOBS --> DB
    JOBS --> REDIS
    ADMIN_UI --> ADMIN_CONTROLLERS
    ADMIN_CONTROLLERS --> ADMIN_COMPONENTS
    ADMIN_CONTROLLERS --> MODELS
```

---

## Component Architecture

### Rails Application Components

```mermaid
graph LR
    subgraph "Controllers"
        CAMPAIGN_CTRL[CampaignsController]
        ENTRY_CTRL[EntriesController]
        USER_CTRL[UsersController]
        ADMIN_CTRL[Admin::DashboardController]
    end
    subgraph "Services"
        AUTH_SVC[AuthenticationService]
        CAMPAIGN_SVC[CampaignService]
        NOTIFY_SVC[NotificationService]
    end
    subgraph "Models"
        USER[User]
        COMPANY[Company]
        CAMPAIGN[Campaign]
        ENTRY[Entry]
        REVIEW[Review]
        SHIPMENT[Shipment]
    end
    subgraph "Components"
        BUTTON[ButtonComponent]
        CARD[CardComponent]
        FORM[FormComponent]
    end
    CAMPAIGN_CTRL --> CAMPAIGN_SVC
    ENTRY_CTRL --> CAMPAIGN_SVC
    USER_CTRL --> AUTH_SVC
    ADMIN_CTRL --> NOTIFY_SVC
    CAMPAIGN_SVC --> CAMPAIGN
    CAMPAIGN_SVC --> ENTRY
    AUTH_SVC --> USER
    NOTIFY_SVC --> USER
    NOTIFY_SVC --> REVIEW
    CAMPAIGN_CTRL --> CARD
    ENTRY_CTRL --> FORM
    USER_CTRL --> BUTTON
```

---

## Data Flow Architecture

### User Application Flow

```mermaid
sequenceDiagram
    participant U as User
    participant V as View (ERB)
    participant C as Controller
    participant S as Service
    participant M as Model
    participant DB as Database

    U->>V: アクセス/操作
    V->>C: リクエスト送信
    C->>S: 業務ロジック呼び出し
    S->>M: データ取得/更新
    M->>DB: クエリ実行
    DB-->>M: データ返却
    M-->>S: 結果返却
    S-->>C: 処理結果
    C-->>V: レンダリング
    V-->>U: 画面表示
```

### Admin Management Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant AV as Admin View (ERB)
    participant AC as Admin Controller
    participant S as Service
    participant M as Model
    participant DB as Database
    participant N as Notification

    A->>AV: 管理画面操作
    AV->>AC: リクエスト送信
    AC->>S: 業務ロジック呼び出し
    S->>M: データ取得/更新
    M->>DB: クエリ実行
    DB-->>M: データ返却
    M-->>S: 結果返却
    S-->>AC: 処理結果
    AC-->>AV: レンダリング
    AV-->>A: 画面表示
    AC->>N: 通知処理
    N-->>A: 通知送信
```

---

## Security Architecture

### Authentication & Authorization

- Devise による認証（ユーザ・管理者分離）
- 権限管理（管理者/一般ユーザ）
- CSRF/XSS/SQL インジェクション対策
- エラーハンドリング・ロギング

---

## Database Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ ADDRESSES : has
    USERS ||--o{ ENTRIES : creates
    USERS ||--o{ REVIEWS : writes
    COMPANIES ||--o{ COMPANY_SNS : has
    COMPANIES ||--o{ CAMPAIGNS : creates
    CAMPAIGNS ||--o{ ENTRIES : receives
    CAMPAIGNS ||--o{ REVIEWS : receives
    ENTRIES ||--o| SHIPMENTS : generates
    ADDRESSES ||--o{ SHIPMENTS : ships_to
```

---

## Deployment Architecture

- Docker Compose による Rails+PostgreSQL+Redis 構成
- .env で環境変数管理
- 本番/開発環境の分離
- 静的ファイルは public/で管理

---

## Performance & Security

- DB インデックス設計
- Redis キャッシュ活用
- N+1 防止・クエリ最適化
- ログ・監査・個人情報マスキング
- HTTPS/セキュリティヘッダー
- 権限管理・認証/認可

---

このアーキテクチャは Rails 単体で「見た目」と「データ」を分離しつつ、管理者/ユーザ画面・API・業務ロジック・セキュリティ・運用まで一貫して設計できる構成です。
