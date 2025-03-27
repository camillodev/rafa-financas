
# Rafa Finanças

A comprehensive frontend application for financial management built with React, TypeScript, and Tailwind CSS.

## Project Structure

The project follows a structured organization:

- **src/components/** – Reusable UI components
- **src/views/** – Page-level components representing routes
- **src/hooks/** – Custom React hooks
- **src/store/** – Global state management with Zustand
- **src/context/** – React Context providers
- **src/utils/** – Utility functions and helpers
- **src/assets/** – Images, fonts, and static files
- **src/styles/** – Global CSS or Tailwind configuration
- **src/tests/** – Unit and integration tests
- **src/public/** – Static publicly accessible files

## State Management

This project uses Zustand for global state management. The main store is `useFinanceStore` which handles all financial data.

For backward compatibility, we also maintain a Context API wrapper around the Zustand store in `FinanceContext.tsx`.

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Supabase for backend services
- ShadCN UI for component design
- React Hook Form + Zod for form handling
