
# Spekulus Widget Store Documentation

## 1. Project Overview

Welcome to Spekulus! This document provides a comprehensive overview of the Spekulus Widget Store project, a modern, feature-rich web application that serves as a curated marketplace for digital widgets. It's designed to be a helpful resource for developers, administrators, and anyone interested in understanding the inner workings of the application.

Spekulus provides a user-friendly interface for users to browse, discover, and interact with a variety of widgets for their personal dashboards or digital spaces. The platform is designed to be both visually appealing and highly functional, incorporating cutting-edge technologies, including AI-powered recommendations and a community-driven ratings system, to deliver a personalized user experience. It also includes a comprehensive admin panel for easy management of the widget catalog and user-generated content.

### Key Features:
- **Widget Discovery**: Browse a catalog of widgets, filterable by category.
- **Detailed Widget Pages**: View in-depth information for each widget, including features, version history, and user reviews.
- **Community Comments & Ratings**: Users can submit comments and a 1-5 star rating for each widget, powered by Appwrite.
- **AI-Powered Recommendations**: Utilizes Genkit and Google AI to provide personalized widget suggestions.
- **Widget of the Day**: A dynamically selected widget is featured daily to promote discovery.
- **Featured Widgets Carousel**: A swipeable carousel on the homepage highlights popular or new widgets.
- **Responsive Design**: Fully responsive layout that works seamlessly across desktops, tablets, and mobile devices, including a "burger" menu for mobile navigation.
- **Admin Panel**: A secure interface for administrators to add, view, edit, and delete widgets, manage user-submitted comments, and manage FAQs and categories. Features comprehensive filtering and sorting for all data tables.

---

## 2. High-Level Architecture

The application follows a modern server-centric architecture using Next.js. For community features, the client-side components communicate directly with the Appwrite backend to fetch and submit comments and ratings. For AI features and content management (like FAQs and categories), the client triggers Server Actions which in turn execute a Genkit flow or communicate with the Appwrite database using a secure, server-side SDK.

```
                  +--------------------------+
                  |    External Services     |
                  |--------------------------|
                  | [G] Google AI (Gemini)   |
                  | [A] Appwrite Cloud (DB)  |
                  +-----------+--------------+
                              |
      +-----------------------+-----------------------+
      | (Server-Side)         | (Client-Side)         |
      v                       v                       v

+----------------+      +------------------------+      +-----------------+
|   Browser      |      |   Next.js Server       |      |   Appwrite SDK  |
| (React Client) |----->|   (App Router)         |<---->|   (lib/appwrite)|
+----------------+      +------------------------+      +-----------------+
    ^  |                        |         ^                   ^  |
    |  | (API Calls)            |         | (AI Recs)         |  | (Comments/Ratings)
    |  v                        v         |                   |  v
+----------------+      +-----------------+      +-----------------+
| User Interface |      |  Server Actions |      |  CommentsSection|
| (shadcn/ui)    |----->|  (actions.ts)   |----->|  (component)    |
+----------------+      +-----------------+      +-----------------+
```

---

## 3. Tech Stack

The project is built on a modern, robust, and scalable tech stack, prioritizing developer experience and performance.

- **Framework**: [Next.js](https://nextjs.org/) (v15) with the App Router for server-centric routing and rendering.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for static typing and improved code quality.
- **UI Library**: [React](https://reactjs.org/) for building interactive user interfaces.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first styling workflow.
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) for a set of beautifully designed, accessible, and customizable components.
- **Database**: [Appwrite](https://appwrite.io/) for managing user-submitted comments, ratings, site settings, FAQs, and categories.
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (specifically `@genkit-ai/googleai`) for integrating Google's Gemini models to power AI features.
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for robust form validation.
- **Icons**: [Lucide React](https://lucide.dev/) for a clean and consistent icon set.

---

## 4. Project Structure

The project follows a standard Next.js App Router structure. Below is an overview of the key directories and files:

```
spekulus-widget-store/
├── src/
│   ├── app/                  # Main application folder (App Router)
│   │   ├── admin/            # Admin panel page and logic
│   │   ├── contact/          # Contact page
│   │   ├── faq/              # FAQ page
│   │   ├── widget/[id]/      # Dynamic route for widget detail pages
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout for the entire application
│   │   ├── globals.css       # Global styles and Tailwind CSS directives
│   │   ├── actions.ts        # Server Actions for AI, Widgets, FAQs, etc.
│   │   └── data.ts           # Static data for widgets
│   │
│   ├── ai/
│   │   ├── flows/
│   │   │   └── widget-recommendations.ts # Genkit flow for AI recommendations
│   │   └── genkit.ts         # Genkit initialization and configuration
│   │
│   ├── components/
│   │   ├── ui/               # Core shadcn/ui components
│   │   ├── comments-section.tsx # Handles comment/rating display and submission
│   │   ├── markdown-renderer.tsx # Renders markdown for comment text
│   │   ├── widget-card.tsx   # Card component for displaying a single widget
│   │   └── ...               # Other reusable components
│   │
│   ├── hooks/
│   │   ├── use-toast.ts      # Custom hook for managing toast notifications
│   │   └── use-mobile.ts     # Custom hook to detect mobile viewports
│   │
│   └── lib/
│       ├── appwrite-server.ts# Server-side Appwrite client
│       ├── appwrite.ts       # Client-side Appwrite client initialization and config
│       ├── types.ts          # TypeScript type definitions
│       └── utils.ts          # Utility functions (e.g., `cn` for classnames)
│
├── public/                   # Static assets like images and fonts
├── .env                      # Environment variables (Appwrite IDs, API Keys)
├── next.config.ts            # Next.js configuration
└── package.json              # Project dependencies and scripts
```

---

## 5. Core Functionality & Data Flows

This section provides a detailed breakdown of the main features and the logic that powers them.

### FAQ, Categories & Site Settings Management

These features are powered by Appwrite and managed via Server Actions.

- **Files**: `src/app/admin/page.tsx` (UI), `src/app/actions.ts` (Logic)
- **Data Flow**:
  ```
  1. Admin Panel (`admin/page.tsx`)
     - User interacts with the FAQ, Category, or Settings form (e.g., clicks "Save").
       |
       v
  2. Server Action (`actions.ts`)
     - The corresponding server action (e.g., `createFaq`, `updateCategory`) is invoked.
       |
       v
  3. Appwrite Server SDK (`appwrite-server.ts`)
     - The server action uses the secure, server-side Appwrite SDK to communicate with the database.
       |
       v
  4. Admin Panel (`admin/page.tsx`)
     - The server action returns a success/error status.
     - The UI updates to reflect the change (e.g., refreshes the list).
  ```

---

## 6. Key Function Explanations

### `src/app/admin/page.tsx` (Admin Panel Logic)

- **Filtering and Sorting**: Each data table (Widgets, Comments, Categories, FAQs) includes a search input for filtering and clickable column headers for sorting data. This logic is handled client-side with `useState` and `useMemo` for high performance.
- **`handleFaqFormSubmit(...)`**: Handles the form submission for creating or updating an FAQ, calling the appropriate server action.
- **`handleCategoryFormSubmit(...)`**: Manages the form for adding or editing widget categories.
- **`handleDeleteFaq(faqId)`**: Calls the `deleteFaq` server action to remove an FAQ.
- **`handleDeleteCategory(categoryId)`**: Calls the `deleteCategory` server action.
- **`handleSettingsSubmit(...)`**: Calls server actions to update the site's contact and social media information.

### `src/app/actions.ts` (Server Actions)
- **`getFaqs()`, `createFaq(...)`, `updateFaq(...)`, `deleteFaq(...)`**: CRUD operations for FAQs.
- **`getCategories()`, `createCategory(...)`, `updateCategory(...)`, `deleteCategory(...)`**: CRUD operations for Categories.
- **`getSiteSettings()`, `createSiteSettings(...)`, `updateSiteSettings(...)`**: Manages the site's global information.

---

## 7. In-Depth Articles

### AI Flow Deep Dive: `widget-recommendations.ts`
The AI-powered widget recommendation feature is orchestrated by a Genkit flow.

- **Purpose**: To provide intelligent widget suggestions based on a user's search query and browsing history.
- **Key Components**:
    - **`WidgetRecommendationsInputSchema` (Zod Schema)**: Defines the expected input: a `searchQuery` and an optional `userHistory`, along with a list of all `allWidgets`.
    - **`WidgetRecommendationsOutputSchema` (Zod Schema)**: Defines the desired output format: an array of recommended widgets, each with a `name` and `description`. This structured output ensures the AI's response is predictable and easy to parse.
    - **`prompt` (Genkit Prompt)**: A carefully crafted template that instructs the Gemini model. It takes the user's query and the entire widget catalog (as a JSON string) and asks the AI to act as an expert recommender.
    - **`widgetRecommendationsFlow` (Genkit Flow)**: The main flow function that takes the input, calls the prompt with the data, and returns the structured JSON output.
    - **`getWidgetRecommendations` (Wrapper Function)**: An exported server-side function that acts as the public API for this flow. It fetches the static widget data from `data.ts` and passes it into the flow, simplifying the process for the calling component.

### Static Data Management: `src/app/data.ts`
- **Purpose**: This file acts as a simple, in-memory database for the widget catalog. For this project, it allows for rapid prototyping and development without the need for a full database setup for the core widget content.
- **Structure**: It exports a single constant, `ALL_WIDGETS`, which is an array of `Widget` objects. Each object contains all the necessary information for a widget, such as its name, description, category, image, and more.
- **Usage**:
    - **Homepage**: The homepage (`page.tsx`) directly imports `ALL_WIDGETS` to display the featured widgets and the main widget list.
    - **Admin Panel**: The admin panel (`admin/page.tsx`) uses this data as the initial state for the list of manageable widgets.
    - **AI Flow**: The recommendation flow uses this data as the "source of truth" for available widgets to recommend from.

### Client-Side State Management
The application uses modern React hooks for managing state within client components.
- **`useState`**: Used for managing simple component state like search queries, selected filters, dialog visibility, and form inputs. For example, in `src/app/page.tsx`, `useState` holds the current `searchQuery` and `activeCategory`.
- **`useEffect`**: Used to trigger side effects, primarily for fetching data from Appwrite or Server Actions when a component mounts or when certain dependencies change. For example, in `src/app/admin/page.tsx`, `useEffect` is used to call `fetchAllComments()` and `fetchFaqs()` once the user is logged in.
- **`useMemo`**: Used for performance optimization. It memoizes the result of expensive calculations, preventing them from being re-run on every render. In the admin panel, `useMemo` is used to filter and sort the lists of widgets, comments, and FAQs only when the source data or the filter/sort criteria change, making the UI highly responsive.

---

## 8. Key Components

- **`layout.tsx`**: The root layout, including the header and footer.
- **`header.tsx`**: The main site header, which includes the logo and primary navigation. It features a responsive "burger" menu for mobile devices, which uses `shadcn/ui`'s `Sheet` component to provide a slide-out navigation panel.
- **`page.tsx` (Home)**: The main entry point for users, featuring widget carousels and filtering.
- **`widget/[id]/page.tsx`**: The detail page for a single widget.
- **`admin/page.tsx`**: A client-side component that renders the entire admin interface.
- **`comments-section.tsx`**: A self-contained component for displaying and submitting comments.
- **`faq/page.tsx`**: The public FAQ page that fetches and displays questions from Appwrite.
- **`contact/page.tsx`**: The contact page, which dynamically loads information from the Site Settings.

---

## 9. Styling and Theming

- **Tailwind CSS**: The primary tool for styling.
- **shadcn/ui Theming**: The color palette and base styles are defined in `src/app/globals.css`.
- **Fonts**: The `Inter` font is imported from Google Fonts in the root `layout.tsx`.

---

## 10. Deployment

The project includes an `apphosting.yaml` file, which configures it for deployment on **Firebase App Hosting**.

---

## 11. Installation and Local Development

This section guides you through setting up the project on your local machine.

### Minimal Requirements
- **Node.js**: v18 or higher.
- **npm** or **yarn**: A Node.js package manager.

### Step 1: Set up the Appwrite Backend
Before running the project, you must set up your Appwrite backend services.

1.  **Create an Appwrite Project**:
    *   Go to your Appwrite Cloud console and create a new project.
    *   Create a new Web platform, adding `localhost` for development.

2.  **Create a Database and Collections**:
    *   In your Appwrite project, go to the **Databases** section and create a new database.
    *   Inside that database, create the following collections with the specified attributes and permissions. **This step is crucial.**

    ---
    **a) `widget_comments`**
    *   **Purpose**: Stores user-submitted comments and ratings.
    *   **Attributes**:
        | Key      | Type    | Size  | Required |
        |:---------|:--------|:------|:---------|
        | `widgetId` | String  | 255   | Yes      |
        | `author`   | String  | 255   | Yes      |
        | `text`     | String  | 5000  | Yes      |
        | `rating`   | Integer | N/A   | Yes      |
    *   **Permissions**: Role: **Any** -> Grant **Create** and **Read** access.

    ---
    **b) `faqs`**
    *   **Purpose**: Stores FAQs for the FAQ page.
    *   **Attributes**:
        | Key        | Type   | Size  | Required |
        |:-----------|:-------|:------|:---------|
        | `question` | String | 500   | Yes      |
        | `answer`   | String | 10000 | Yes      |
    *   **Permissions**: Role: **Any** -> Grant **Read** access.

    ---
    **c) `site_settings`**
    *   **Purpose**: Stores global site information like contact details and social links. Only one document should exist in this collection.
    *   **Attributes**:
        | Key        | Type   | Size  | Required |
        |:-----------|:-------|:------|:---------|
        | `key`      | String | 255   | Yes      |
        | `email`    | Email  | 255   | No       |
        | `address`  | String | 500   | No       |
        | `phone`    | String | 255   | No       |
        | `website`  | URL    | 2000  | No       |
        | `facebook` | URL    | 2000  | No       |
        | `twitter`  | URL    | 2000  | No       |
        | `github`   | URL    | 2000  | No       |
        | `linkedin` | URL    | 2000  | No       |
    *   **Permissions**: Role: **Any** -> Grant **Read** access.

    ---
    **d) `widget_categories`**
    *   **Purpose**: Stores the widget categories for filtering and management.
    *   **Attributes**:
        | Key        | Type   | Size  | Required |
        |:-----------|:-------|:------|:---------|
        | `name`     | String | 255   | Yes      |
    *   **Permissions**: Role: **Any** -> Grant **Read** access.

### Step 2: Configure Local Environment

1.  **Clone the Repository**:
    ```bash
    git clone <your-repository-url>
    cd spekulus-widget-store
    ```

2.  **Create `.env` File**:
    *   Create a file named `.env` in the project root.
    *   Populate it with your Appwrite Project ID, Database ID, Collection IDs, and your Google AI and Appwrite API keys. This file is for local development and should **not** be committed to version control.

        ```env
        # Appwrite Configuration (Client & Server)
        # These are exposed to the client-side and are used for client-side Appwrite SDK initialization.
        NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
        NEXT_PUBLIC_APPWRITE_PROJECT_ID="<YOUR_APPWRITE_PROJECT_ID>"
        NEXT_PUBLIC_APPWRITE_DATABASE_ID="<YOUR_DATABASE_ID>"
        NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID="<YOUR_WIDGET_COMMENTS_COLLECTION_ID>"
        NEXT_PUBLIC_APPWRITE_SITE_SETTINGS_COLLECTION_ID="<YOUR_SITE_SETTINGS_COLLECTION_ID>"
        NEXT_PUBLIC_APPWRITE_FAQ_COLLECTION_ID="<YOUR_FAQS_COLLECTION_ID>"
        NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID="<YOUR_WIDGET_CATEGORIES_COLLECTION_ID>"

        # Google AI Configuration (Server-Side)
        # Used by Genkit for AI-powered features. This key is used on the server and is not exposed to the client.
        GEMINI_API_KEY="<YOUR_GOOGLE_AI_API_KEY>"

        # Appwrite API Key (Server-Side)
        # This is a secret key for use in server-side actions to bypass permissions.
        APPWRITE_API_KEY="<YOUR_APPWRITE_SERVER_API_KEY>"
        ```

### Step 3: Install Dependencies and Run

1.  **Install Packages**:
    ```bash
    npm install
    ```

2.  **Run the Development Servers**:
    *   Start the Next.js application:
        ```bash
        npm run dev
        ```
    *   In a new terminal, start the Genkit development server:
        ```bash
        npm run genkit:watch
        ```

The application will be available at `http://localhost:3000`.

---

## 12. Troubleshooting

This section covers common issues you might encounter during setup and development.

### Appwrite & Database Errors

- **Error**: `AppwriteException: Collection not found` or an HTTP 404 error when the app tries to fetch data (e.g., comments, FAQs).
    - **Cause**: This is the most common setup issue. It means that the required Appwrite collections have not been created, or their IDs in the `.env` file are incorrect.
    - **Fix**:
        1.  Carefully follow the instructions in the **"Create a Database and Collections"** section above.
        2.  Ensure every collection is created with the exact attributes (Key, Type, Size, Required) as specified.
        3.  Double-check that the Collection ID from your Appwrite project is copied correctly into the corresponding `NEXT_PUBLIC_APPWRITE_*_COLLECTION_ID` variable in your `.env` file.
        4.  Make sure you have set the correct **Permissions** for each collection. Forgetting to grant "Read" access to "Role: Any" is a frequent mistake.

- **Error**: `AppwriteException: Invalid project` or connection timeout.
    - **Cause**: The Appwrite endpoint or project ID in your `.env` file is incorrect.
    - **Fix**:
        1.  In your Appwrite Cloud dashboard, go to your project's **Settings** page.
        2.  Verify that the `NEXT_PUBLIC_APPWRITE_ENDPOINT` and `NEXT_PUBLIC_APPWRITE_PROJECT_ID` in your `.env` file exactly match the **API Endpoint** and **Project ID** shown in your Appwrite settings.

### Build & Development Errors

- **Error**: `npm run dev` fails or the application crashes on startup.
    - **Cause**: This can be due to several issues with the local environment setup.
    - **Fix**:
        1.  **Check Node.js Version**: Ensure you are using a compatible version of Node.js (v18 or higher is recommended).
        2.  **Missing `.env` file**: The application requires environment variables to connect to its services. Make sure you have created a `.env` file in the project root as described in the **"Configure Local Environment"** section.
        3.  **Missing Dependencies**: Run `npm install` to ensure all required packages are installed in your `node_modules` directory. If issues persist, try deleting `node_modules` and the `package-lock.json` file, then run `npm install` again.

- **Error**: AI features are not working, or you see an error related to `GEMINI_API_KEY`.
    - **Cause**: The Google AI API key is missing or invalid.
    - **Fix**: Ensure the `GEMINI_API_KEY` variable in your `.env` file is set correctly with a valid API key from Google AI Studio.
