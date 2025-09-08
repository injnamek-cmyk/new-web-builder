# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Runs Next.js with Turbopack for faster development
- **Build**: `npm run build` - Creates production build with Turbopack optimization
- **Start production**: `npm start` - Serves production build
- **Lint**: `npm run lint` - Runs ESLint for code quality checks

## Project Architecture

### Technology Stack
- **Frontend**: Next.js 15.5.2, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **State Management**: Zustand for global editor state
- **Drag & Drop**: @dnd-kit (core, sortable, utilities)
- **UI Components**: Radix UI primitives, Lucide React icons

### Architecture Pattern
This is a visual web builder using **Feature-Sliced Design (FSD)** architecture:

```
src/
├── app/               # Next.js App Router pages
├── processes/         # Global state management (Zustand store)
├── widgets/           # Complex UI compositions (Layout, Canvas, PropertyPanel)  
├── features/          # Independent feature units (drag-drop, draggable-element)
├── entities/          # Domain objects and business logic
├── shared/            # Shared utilities, types, and configurations
│   ├── types/         # Global TypeScript definitions
│   └── lib/           # Common utilities (element-factory)
├── components/        # shadcn/ui components
└── bundled-components/ # Custom components for the builder
```

### Key Architecture Concepts

**Editor State Management (`src/processes/editor-store.ts`)**:
- Centralized Zustand store managing canvas, elements, history, and UI state
- Supports multi-selection, drag & drop, grid snapping, and undo/redo history
- Canvas operates with 1920x1080 dimensions and 24x20 grid system

**Element System (`src/shared/types/index.ts`)**:
- Type-safe element definitions: text, image, button, container, accordion, calendar
- All elements extend `BaseElement` with position (x, y), size, zIndex, and spacing
- Elements support auto-sizing and grid snapping functionality

**Drag & Drop System (`src/features/drag-drop.tsx`)**:
- Uses @dnd-kit with pointer sensors and 8px activation distance
- Automatically shows grid during dragging for visual feedback
- Supports zoom-aware positioning and grid snapping

**Element Factory (`src/shared/lib/element-factory.ts`)**:
- Creates new elements with sensible defaults
- Generates unique IDs and handles element-specific properties
- Supports partial overrides for customization

### Component Structure
- **Layout** (`src/widgets/layout.tsx`): Main application shell with responsive design
- **Canvas**: Renders elements with drag & drop capabilities
- **PropertyPanel**: Context-aware property editing for selected elements
- **DraggableElement**: Wrapper enabling drag behavior for canvas elements

### Development Patterns
- All UI components use Tailwind CSS for styling consistency
- shadcn/ui provides accessible, customizable base components
- TypeScript is strictly enforced for type safety
- State mutations go through the Zustand store for predictable updates
- Grid system uses 80px cells (1920px ÷ 24 columns)

### Project Rules & Goals
Based on PROJECT_RULES.md, this is a progressive web builder project:
- **Phase 1**: Frontend-focused rapid prototyping with local state
- **Phase 2**: Server-driven UI architecture for dynamic content generation  
- Emphasis on drag & drop UX, real-time style editing, and component reusability
- FSD architecture chosen for scalability while avoiding unnecessary complexity

### API Routes
- `/api/build` - Handles build operations
- `/api/deploy` - Manages deployment functionality