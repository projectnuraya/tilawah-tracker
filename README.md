# Tilawah Tracker 📖

A simple, mobile-first web application to help coordinators track and manage group tilawah (Qur’an reading) programs such as "One Week One Juz".

This application is designed to replace manual WhatsApp tracking with a structured system while preserving the familiar copy-paste sharing format.

## 🚀 Features

### For Coordinators (Authenticated)

- **Group Management**: Create and manage groups with a permanent public link.
- **Participant Tracking**: Add participants and automatically assign juz.
- **Period Management**:
  - Weekly cycles (always Monday to Sunday).
  - **Auto-Rotation**: Juz assignments automatically rotate each week (Juz 1 → Juz 2).
  - **Locking**: Lock periods to preserve history (auto-marks unfinished as "Missed").
- **WhatsApp Integration**:
  - Generate formatted status messages (👑 Finished / 💔 Missed).
  - One-click copy for sharing to WhatsApp groups.
  - "Remind" button for participants with saved numbers.

### For Public Viewers (No Login)

- **Read-Only Access**: View ongoing and past periods via a unique, unlisted link.
- **Transparency**: See who has finished their juz without needing an account.
- **Privacy**: WhatsApp numbers are hidden from public view.

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Monolith)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma (v5.x)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Auth**: NextAuth.js (Google OAuth)
- **Deployment**: Docker (capable)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database
- Google Cloud Console Project (for OAuth)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/projectnuraya/tilawah-tracker.git
    cd tilawah-tracker
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Dupicate `.env.example` (or create `.env`) and add your secrets:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/tilawah_tracker"
    NEXTAUTH_SECRET="your_generated_secret"
    NEXTAUTH_URL="http://localhost:3000"
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    ```

4.  **Initialize Database**

    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
