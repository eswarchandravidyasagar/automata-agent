# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a **full-stack Next.js application** with TypeScript and Tailwind CSS. The project includes:
- **Frontend**: React components, custom hooks, responsive UI
- **Backend**: RESTful API routes, middleware, data validation
- **TypeScript**: Comprehensive type safety across frontend and backend
- **Tailwind CSS**: Utility-first styling with custom components
- **Modern Architecture**: App Router, server components, API routes

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks and custom data fetching hooks
- **API**: RESTful endpoints with standardized responses
- **Code Quality**: ESLint, TypeScript compiler
- **Development**: Hot Module Replacement, TypeScript checking

## Coding Guidelines
- **TypeScript First**: Use TypeScript for all components, utilities, and API routes
- **API Design**: Follow RESTful conventions with standardized response formats
- **Components**: Prefer functional components with hooks over class components
- **Server vs Client**: Use server components by default, client components only when needed
- **Error Handling**: Implement comprehensive error handling in both API routes and components
- **Type Safety**: Define interfaces and types for all data structures
- **Code Organization**: Follow the established folder structure in `src/`
- **Validation**: Validate inputs on both client and server sides

## File Structure
- `src/app/` - App Router pages, layouts, and API routes
- `src/app/api/` - Backend API endpoints
- `src/components/` - Reusable React components
- `src/components/ui/` - Base UI components (buttons, inputs, etc.)
- `src/hooks/` - Custom React hooks for data fetching and state management
- `src/lib/` - Utility functions, configurations, and helpers
- `src/types/` - TypeScript type definitions and interfaces
- `public/` - Static assets

## Best Practices
- **API Routes**: Use proper HTTP methods and status codes
- **Components**: Create reusable, well-typed components
- **Hooks**: Extract data fetching logic into custom hooks
- **Styling**: Use Tailwind CSS utility classes consistently
- **Performance**: Optimize with Next.js features (Image, dynamic imports)
- **Accessibility**: Follow WCAG guidelines for accessible UI
- **Security**: Validate and sanitize all inputs
- **Testing**: Write testable, pure functions when possible
