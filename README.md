# PocketTranscribe

An enterprise-grade, full-stack application for automated meeting transcription and summarization. This system provides a seamless recording-to-insight pipeline, leveraging high-accuracy AI models for reliable background processing and persistent data management.

## System Architecture

```mermaid
graph TD
    subgraph Mobile_App ["Mobile Application (React Native / Expo)"]
        UI[UI Layer - React Components]
        Context[State - Context API]
        Audio[Audio Engine - expo-audio]
        Hooks[Data Layer - Custom Hooks]
    end

    subgraph Backend_Services ["Backend Infrastructure (FastAPI)"]
        API[API Layer - REST Endpoints]
        Worker[Background Tasks - AI Processing]
        AI[AI Models - Whisper-1 / GPT-4o]
    end

    subgraph Data_Persistence ["Data & Security (Supabase)"]
        Auth[Authentication]
        Storage[S3 Storage - Audio Files]
        DB[(PostgreSQL - RLS Enabled)]
    end

    UI <--> Context
    Context <--> Hooks
    Audio --> UI
    Hooks <--> Auth
    Hooks --> Storage
    Hooks <--> API
    API <--> Worker
    Worker --> AI
    Worker <--> DB
    API <--> DB
```

### Core Infrastructure

The mobile application is built on React Native and the Expo SDK, utilizing a hooked, layered architecture to maintain separation of concerns between state management and the view layer.

- **Data Access Layer**: Abstracted via custom React hooks that interface with the Supabase client and backend REST endpoints.
- **State Management**: Orchestrated through Context API for global session and notification states, and granular local state for UI transitions.
- **Media Processing**: Leverages the expo-audio platform for low-latency audio capture with background execution capabilities.

### Backend Infrastructure

A Python-based FastAPI service handles computationally intensive operations and third-party integrations.

- **API Layer**: Asynchronous REST endpoints with Pydantic-driven request/response validation.
- **Worker Layer**: Background task orchestration for AI processing to ensure low API latency.
- **Database Layer**: Multi-access strategy utilizing both Supabase Client for client-side interactions and direct PostgreSQL connections via Psycopg2 for system-level operations bypassing Row Level Security.

### Data Flow

1. Audio is captured locally and uploaded to Supabase Storage.
2. The Mobile client notifies the Backend via a processing request.
3. The Backend Worker executes Whisper-1 for transcription and GPT models for summarization.
4. Data is persisted to PostgreSQL under strict RLS policies.
5. The user is notified via Expo Push Notifications upon completion.

## Engineering Principles

To ensure maintainability and scalability, the following principles were applied throughout the development:

- **Layered Architecture**: Strict separation between UI, Business Logic (Hooks), and Data Access (Services/Clients).
- **Type Safety**: End-to-end TypeScript on the frontend and Pydantic models on the backend to minimize runtime errors.
- **Asynchronous Processing**: Non-blocking background workers for AI-heavy tasks, ensuring high responsiveness for mobile users.
- **Security First**:
  - **Row Level Security (RLS)**: Direct database access from the client is restricted at the PostgreSQL level.
  - **Service Role Governance**: Sensitive operations use the Supabase Service Role solely within the secure backend environment.
  - **Environment Abstraction**: Zero hardcoded secrets; strictly controlled via `.env` files.

### Architecture Decisions

- **Frontend Framework**: **React Native with Expo** was chosen for its rapid development cycle, cross-platform compatibility, and easy native module integration via Config Plugins.
- **Backend Framework**: **FastAPI (Python)** selected for high-performance async handling and seamless integration with AI libraries.
- **Database & Auth**: **Supabase** (PostgreSQL) provides robust relational data storage with Row Level Security (RLS) and secure authentication.
- **Audio Engine**: **expo-audio** ensures reliable high-quality background recording on both iOS and Android.
- **State Management**: **React Context** offers a lightweight, predictable solution for global state without Redux boilerplate.

### Future Improvements

With more time, priority would be given to:

1.  **Real-time Transcription**: Streaming audio via WebSockets for live feedback.
2.  **Offline-first Queue**: robust job queue for uploads when connectivity is restored.
3.  **Speaker Diarization**: Distinguishing different speakers in the transcript.
4.  **E2E Testing**: Automated testing with Detox or Maestro for critical flows.
5.  **CI/CD Pipeline**: Automated EAS Build and Submit workflows.

## Getting Started

### Platform Requirements

- **Operating Systems**: macOS (required for iOS builds), Linux, or Windows.
- **Mobile Environment**: iOS 15.0+ or Android 12.0+; physical devices required for background audio verification.

### Software Dependencies

- **Node.js**: Version 20.x or higher (LTS recommended).
- **Python**: Version 3.10 or higher.
- **Package Managers**: npm 10.x+ or yarn 1.22+.
- **Expo CLI**: Latest stable version provided via npx.
- **Native Toolchain (Optional)**:
  - **iOS**: Xcode 15+, CocoaPods 1.15+, and `ios-deploy` for local device deployment.
  - **Android**: Android Studio, Android SDK (API 34+), and a configured emulator or physical device via ADB.

## Installation

### 1. Clone Repository

Clone the repository and its associated submodules:

```bash
git clone https://github.com/muhvarriel/pocket-transcribe.git
cd pocket-transcribe
```

### 2. Frontend Setup

Install dependencies at the root:

```bash
npm install
```

### 3. Backend Setup

Initialize the Python virtual environment and install requirements:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configuration

The system relies on environment-specific variables. Create a .env file in both the app and backend directories.

### App Configuration (./.env)

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://your_local_ip:8000
```

### Backend Configuration (backend/.env)

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
DIRECT_DB_URL=postgresql://postgres:password@db.project_ref.supabase.co:5432/postgres
OPENAI_API_KEY=your_openai_api_key
```

## Usage

### Development Execution

Start both services concurrently to enable full-stack functionality:

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
npx expo start
```

### Native Development & Prebuilding

For features requiring native module modifications or local native builds, use the prebuild workflow:

#### 1. Generate Native Directories

Generates the `ios` and `android` directories based on `app.json` configuration and plugins.

```bash
npx expo prebuild
```

#### 2. Local Native Execution

Run the app directly in a simulator or on a physical device using native code:

```bash
# Start on iOS Simulator
# (Note: This automatically runs 'pod install' if needed)
npx expo run:ios

# Start on a Physical iOS Device
# (Tip: Use --device to specify the device name or ID)
npx expo run:ios --device "Your Device Name"

# Start on Android Emulator
npx expo run:android
```

#### 3. iOS Physical Device Configuration (Signing & Provisioning)

To run on a physical device, you must ensure that **Automatic Signing** is enabled and that your dev machine has the necessary permissions to update provisioning profiles.

**Enable Automatic Signing via CLI**:
If you get a "No profiles found" error, ensure `ProvisioningStyle = Automatic` and your `DevelopmentTeam` ID are set in `ios/PocketTranscribe.xcodeproj/project.pbxproj`.

**Force Provisioning Updates**:
If the build fails due to profile mismatches, run:

```bash
xcodebuild -workspace ios/PocketTranscribe.xcworkspace -scheme PocketTranscribe -configuration Debug -destination 'platform=iOS,name=Your Device Name' -allowProvisioningUpdates build
```

#### 4. iOS Push Notification Configuration (Required for Real Device)

To receive push notifications on a physical iOS device, you must configure the following in Xcode:

1.  Open the iOS project: `xed ios`
2.  Select the **PocketTranscribe** target in the sidebar.
3.  Go to the **Signing & Capabilities** tab.
4.  Click **+ Capability** and add:
    - **Push Notifications**
    - **Background Modes** (Then check **Remote notifications**)
5.  Ensure a valid **Development Team** is selected.

> [!NOTE]
> Simulated notifications are automatically enabled for simulators and development accounts without push capabilities.

#### Troubleshooting iOS Build Failures

> [!CAUTION]
> **Critical: No Spaces in File Path**
> The iOS build system **will fail** if your project path contains spaces (e.g., `/Working Space/`).
>
> **Error Message**: `PhaseScriptExecution [CP-User] Generate app.config for prebuilt Constants.manifest`
>
> **Solution**:
>
> 1. Rename parent directories to use underscores or camelCase (e.g., `Working_Space`).
> 2. Or move the project to a clean path like `~/Developer/pocket-transcribe`.
> 3. Run `npx expo prebuild --clean` after moving.

#### Troubleshooting Android Build Failures

> [!IMPORTANT]
> **Android SDK Location**
> If the build fails with `SDK location not found`, create a `local.properties` file in the `android/` directory:
>
> **File**: `android/local.properties`
>
> ```properties
> sdk.dir=/Users/your_user/Library/Android/sdk
> ```
>
> (Replace `your_user` with your actual username).

#### iOS Provisioning Profile Issues (Push Notifications)

> [!IMPORTANT]
> **Error**: `Provisioning profile ... doesn't include the Push Notifications capability.`
>
> If you encounter this error when running on a physical device, follow these steps:
>
> 1.  **Open Xcode**: `xed ios`
> 2.  **Toggle Signing**:
>     - Go to **Signing & Capabilities**.
>     - Uncheck **Automatically manage signing**, then re-check it.
> 3.  **Refresh Capabilities**:
>     - Remove the **Push Notifications** capability (click the 'x').
>     - Add it back by clicking **+ Capability**.
> 4.  **Developer Portal Check**:
>     - Log in to [Apple Developer Portal](https://developer.apple.com).
>     - Go to **Identifiers** and find `com.pocket-transcribe.app`.
>     - Ensure **Push Notifications** is checked/enabled.
> 5.  **Clean Build**: Run `npx expo prebuild --clean` then try building again.

#### Apple Team ID Mismatch

> [!IMPORTANT]
> **Configuration Source**: `app.json > expo > ios > appleTeamId`
>
> If you are building with a different Apple Developer account, you **must update** the `appleTeamId` in `app.json` before running `npx expo run:ios`.
>
> 1. Find your Team ID in the [Apple Developer Portal > Membership](https://developer.apple.com/account/#!/membership).
> 2. Update the value in `app.json`.
> 3. Run `npx expo prebuild --clean` to regenerate the native project with the correct team configuration.

#### Entitlement Mismatch (aps-environment)

> [!WARNING]
> If building for a device fails with a signing error related to `aps-environment` (Push Notifications), and you haven't enabled Push Notifications in the Apple Developer Portal yet:
>
> 1. Temporarily remove the `<key>aps-environment</key>` section from `ios/PocketTranscribe/PocketTranscribe.entitlements`.
> 2. Build and run the app.
> 3. Once the app ID is configured with Push Notifications in the portal, restore the entitlement.

#### Missing Team ID or Provisioning Errors

If you see an error like `Provisioning profile ... doesn't include the Push Notifications capability`:

1. Ensure your `appleTeamId` in `app.json` is correct.
2. Run `yes | npx expo prebuild --clean` to regenerate the project.
3. If error persists, follow the "Entitlement Mismatch" steps above.

### Building for Production

#### Running Release Builds Locally

Execute native builds directly on connected devices/simulators to test performance:

```bash
# Android
npx expo run:android --variant release

# iOS
npx expo run:ios --configuration Release
```

#### Generating Installable Artifacts (APK / IPA)

To generate standalone application files for manual distribution:

**Android (APK)**

This command will assemble the release APK:

```bash
cd android
./gradlew assembleRelease
```

The output file will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

**iOS (IPA)**

To generate an IPA for TestFlight or Ad-hoc distribution (requires macOS & Xcode):

1. Open the project workspace:
   ```bash
   xed ios
   ```
2. Select **"Any iOS Device (arm64)"** as the build target.
3. Choose **Product > Archive** from the Xcode menu.
4. Once archived, the Organizer window will open. Click **Distribute App** and follow the prompts to export the `.ipa` file (select "App Store Connect" or "Ad Hoc" distribution methods).

## Testing

### Frontend Quality Audit

Run static analysis and type verification:

```bash
npm run lint
npm run typecheck
```

### Backend Quality Audit

Execute code quality verification:

```bash
cd backend
source venv/bin/activate
pylint main.py services.py database_utils.py models.py
```

# Project Structure

```text
.
├── app                  # Expo Router pages and navigation
├── components           # Reusable UI primitives
├── hooks                # Business logic and data fetching hooks
├── context              # Global state providers
├── lib                  # External service clients (Supabase)
├── plugins              # Custom Expo config plugins
├── constants            # Theme and configuration tokens
├── assets               # Static assets (icons, splash)
├── types                # TypeScript type definitions
├── backend              # Python FastAPI Application
│   ├── main.py          # API entry point and route definitions
│   ├── services.py      # Core AI processing logic
│   ├── database.py      # Database session management
│   ├── database_utils.py # DB utility functions
│   ├── models.py        # Pydantic data schemas
│   └── schema.sql       # SQL initialization script
├── package.json         # Frontend dependencies and scripts
└── app.json             # Expo configuration
```

## Version Control

This project adheres to a strict Git workflow to ensure code stability and collaborative efficiency.

### Branching Strategy

- **`main`**: The production-ready branch. Direct commits are prohibited; all changes must merge via Pull Requests (PRs).
- **`feature/*`**: For new capabilities (e.g., `feature/realtime-transcription`).
- **`fix/*`**: For bug remediation (e.g., `fix/audio-buffer-overflow`).
- **`chore/*`**: For maintenance, dependency updates, and tooling (e.g., `chore/update-expo-sdk`).
- **`refactor/*`**: For code restructuring that does not alter external behavior.
- **`docs/*`**: For documentation improvements.

### Commit Convention

We follow the **Conventional Commits** specification to streamline semantic versioning and changelog generation.

**Format**:

```text
<type>(<scope>): <short summary>

[Optional body]

[Optional footer(s)]
```

**Common Types**:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

**Example**:
`feat(audio): implement background recording service via expo-audio`

### Application Versioning

The application uses **Semantic Versioning 2.0.0** (`MAJOR.MINOR.PATCH`).

- **Source of Truth**: The `version` field in `app.json` is the single source of truth for the application version.
- **Native Build Numbers**:
  - Android: `android.versionCode` in `app.json` (Integer).
  - iOS: `ios.buildNumber` in `app.json` (String).
- **Synchronization**: `package.json` version should be kept in sync with `app.json` for consistency, though `app.json` takes precedence for build generation.

When preparing a release, update `app.json` before running `npx expo prebuild` or generating a production build.

## Contributing

1. Establish a feature branch from main.
2. Adhere to documented coding standards (ESLint for TypeScript, Pylint for Python).
3. Ensure all tests pass before submitting a Pull Request.
4. Provide comprehensive unit tests for new logic modules.

## License

Copyright Muhvarriel. All Rights Reserved. Private proprietary software.
