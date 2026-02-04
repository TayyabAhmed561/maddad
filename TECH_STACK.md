# Maddad Tech Stack & Implementation Guide

## Overview

Maddad is built as a modern, performant React SPA using TypeScript, Vite, and a comprehensive component library. The architecture emphasizes type safety, developer experience, and maintainability.

---

## Core Build & Development

### **Vite** (Build Tool)

- **Version**: 5.4.19
- **Plugin**: `@vitejs/plugin-react-swc` (SWC for faster compilation)
- **Configuration** (`vite.config.ts`):
  ```typescript
  - Path aliases: @ → ./src
  - Dev server: Port 8080, HMR enabled
  - Component tagger: Development-only for Lovable integration
  ```

**Key Features:**

- Fast HMR (Hot Module Replacement)
- SWC compiler (Rust-based, faster than Babel)
- Optimized production builds
- Path alias resolution (`@/` imports)

---

## Frontend Framework

### **React 18.3.1**

- **Pattern**: Functional components with hooks
- **Key Hooks Used**:
  - `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`
  - Custom hooks: `useDonation`, `useRecurringDonation`, `useScrollToTop`, `use-mobile`
- **Rendering**: Client-side rendering (CSR)
- **Performance**:
  - Memoization with `useMemo` for expensive computations
  - `useCallback` for stable function references
  - Lazy loading potential (not currently implemented)

### **TypeScript 5.8.3**

- **Configuration**: Multi-project setup (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`)
- **Strictness**: Relaxed (for faster development)
  - `noImplicitAny: false`
  - `strictNullChecks: false`
- **Path Mapping**: `@/*` → `./src/*`
- **Type Safety**: Full type coverage for components, hooks, and data models

**Type System Highlights:**

- Custom types in `src/types/giving.ts`
- Interface definitions for all data structures
- Generic types for reusable components

---

## Styling Architecture

### **Tailwind CSS 3.4.17**

- **Configuration**: Extended theme with custom design tokens
- **PostCSS**: Autoprefixer for browser compatibility
- **Custom Design System**:
  - HSL color variables (CSS custom properties)
  - Custom spacing, shadows, animations
  - Typography scale (Inter + Playfair Display)

**Design Tokens:**

```typescript
// Colors: Primary (emerald), Accent (gold), Trust (blue)
// Backgrounds: Warm, cream variants
// Shadows: Soft, card, elevated, prominent, warm
// Animations: fade-in-up, scale-in, gentle-pulse
```

### **CSS Architecture** (`src/index.css`)

- **Layers**: Base, Components, Utilities
- **CSS Variables**: HSL-based color system
- **Custom Components**:
  - Pattern backgrounds (geometric, arch, subtle)
  - Badge styles (verified, pending, unverified)
  - Category tags
  - Progress bars
  - Card interactions
  - Section backgrounds

**Pattern Implementation:**

- Utility-first approach
- Component classes for complex patterns
- CSS-in-CSS (not CSS-in-JS) for better performance

---

## UI Component Library

### **shadcn/ui** (Component System)

- **Base**: Radix UI primitives
- **Styling**: Tailwind CSS
- **Configuration** (`components.json`):
  - Style: `default`
  - TSX components
  - CSS variables for theming
  - Path aliases configured

**Components Used:**

- Form controls (Button, Input, Select, Checkbox, Switch)
- Layout (Card, Separator, Tabs, Accordion)
- Overlays (Dialog, Drawer, Popover, Tooltip, Toast)
- Navigation (Breadcrumb, Navigation Menu)
- Data display (Table, Badge, Avatar, Progress)
- Feedback (Alert, Alert Dialog, Sonner toast)

### **Radix UI** (Headless Components)

- **Philosophy**: Unstyled, accessible primitives
- **Features**:
  - ARIA-compliant
  - Keyboard navigation
  - Focus management
  - Portal rendering for overlays

**Key Radix Packages:**

- `@radix-ui/react-dialog` - Modals
- `@radix-ui/react-dropdown-menu` - Dropdowns
- `@radix-ui/react-popover` - Popovers
- `@radix-ui/react-select` - Select inputs
- `@radix-ui/react-toast` - Toast notifications
- And 20+ more primitives

---

## Routing

### **React Router v6.30.1**

- **Pattern**: Declarative routing with `<Routes>` and `<Route>`
- **Features**:
  - Nested routes
  - Route parameters (`:id`)
  - Hash navigation (for scroll-to sections)
  - Programmatic navigation with `useNavigate`

**Route Structure:**

```typescript
/ → Index (landing page)
/explore → Map view
/needs/:id → Need detail
/appeals → Appeals listing
/appeals/:id → Appeal detail
/giving → Giving hub
/giving/:type → Specific giving type (fidya, zakat, etc.)
/charity/:id → Charity detail
/impact → Impact page
/verification → Verification page
```

**Scroll Restoration:**

- Custom `ScrollToTop` component
- Handles hash anchors for smooth scrolling
- Resets scroll on route change

---

## State Management

### **TanStack Query (React Query) 5.83.0**

- **Purpose**: Server state management (currently minimal usage)
- **Setup**: `QueryClientProvider` in App root
- **Future Use**: API data fetching, caching, synchronization

### **Local State Management**

- **React Hooks**: Primary state management
- **Custom Hooks**:
  - `useDonation`: Donation form state
  - `useRecurringDonation`: Recurring donation logic
  - `use-mobile`: Responsive breakpoint detection
  - `useScrollToTop`: Scroll behavior
  - `use-toast`: Toast notifications

**State Patterns:**

- Component-level state with `useState`
- Derived state with `useMemo`
- Callback memoization with `useCallback`
- Ref-based imperative handles

---

## Maps Integration

### **Mapbox GL JS 3.18.1**

- **Wrapper**: `react-map-gl` 8.1.0
- **Features**:
  - Interactive map with markers
  - Custom popups
  - Camera controls (zoom, pan, bounds)
  - Geocoding (implicit via Mapbox)
  - Custom styling

**Implementation** (`MaddadMap.tsx`):

- Ref-based map instance management
- Marker clustering (via custom logic)
- Category-based marker colors
- Scope-based filtering (local, provincial, Canada, global)
- User location detection
- Panel-aware camera padding

**Map Data**:

- Static data in `src/data/mapData.ts`
- Real items + placeholder items
- Category-based color coding
- Verification status indicators

---

## Forms & Validation

### **React Hook Form 7.61.1**

- **Pattern**: Uncontrolled components with validation
- **Integration**: `@hookform/resolvers` for Zod validation

### **Zod 3.25.76**

- **Purpose**: Schema validation
- **Usage**: Form validation schemas
- **Type Inference**: Generates TypeScript types from schemas

**Form Pattern:**

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {...}
});
```

---

## Data Visualization

### **Recharts 2.15.4**

- **Purpose**: Charts and graphs
- **Usage**: Impact visualization, statistics
- **Features**: Responsive, customizable, accessible

---

## Utilities & Helpers

### **Class Management**

- **clsx**: Conditional class names
- **tailwind-merge**: Merge Tailwind classes intelligently
- **Utility**: `cn()` function in `src/lib/utils.ts`

### **Date Handling**

- **date-fns 3.6.0**: Date formatting and manipulation
- **react-day-picker 8.10.1**: Date picker component

### **Icons**

- **lucide-react 0.462.0**: Icon library (400+ icons)
- **Usage**: Consistent iconography throughout app

### **Animations**

- **tailwindcss-animate 1.0.7**: Tailwind animation utilities
- **Custom animations**: Defined in `index.css`

---

## Development Tools

### **ESLint 9.32.0**

- **Config**: Flat config format
- **Plugins**:
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-react-refresh`
  - `typescript-eslint`
- **Rules**: Relaxed for development speed

### **Testing**

- **Vitest 3.2.4**: Test runner
- **Testing Library**: `@testing-library/react`, `@testing-library/jest-dom`
- **Environment**: jsdom for DOM simulation
- **Setup**: `src/test/setup.ts`

### **Type Checking**

- **TypeScript**: Compile-time type checking
- **Strict Mode**: Disabled for faster iteration

---

## Build & Deployment

### **Build Process**

```bash
npm run build      # Production build
npm run build:dev  # Development build
npm run preview    # Preview production build
```

### **Development Server**

```bash
npm run dev        # Start dev server (port 8080)
```

### **Output**

- **Directory**: `dist/`
- **Format**: Static assets (HTML, CSS, JS)
- **Optimization**: Vite's production optimizations

---

## Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # shadcn/ui components
│   ├── map/          # Map-related components
│   ├── giving/       # Giving-specific components
│   └── skeletons/    # Loading skeletons
├── pages/            # Route components
├── hooks/            # Custom React hooks
├── lib/              # Utilities
├── types/            # TypeScript types
├── data/             # Static data
├── assets/           # Images, logos
└── test/             # Test setup
```

---

## Key Implementation Patterns

### **1. Component Composition**

- Small, focused components
- Composition over inheritance
- Props drilling minimized with context where needed

### **2. Type Safety**

- Full TypeScript coverage
- Interface definitions for all data
- Generic types for reusability

### **3. Performance Optimization**

- `useMemo` for expensive computations
- `useCallback` for stable references
- Lazy loading potential (not yet implemented)

### **4. Responsive Design**

- Mobile-first approach
- `use-mobile` hook for breakpoint detection
- Conditional rendering based on screen size

### **5. Accessibility**

- Radix UI primitives (ARIA-compliant)
- Semantic HTML
- Keyboard navigation support

### **6. Design System**

- CSS variables for theming
- Consistent spacing scale
- Typography hierarchy
- Color system with semantic naming

---

## Dependencies Summary

### **Core**

- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.19

### **UI & Styling**

- Tailwind CSS 3.4.17
- shadcn/ui (Radix UI)
- lucide-react (icons)

### **Routing & State**

- React Router 6.30.1
- TanStack Query 5.83.0

### **Forms**

- React Hook Form 7.61.1
- Zod 3.25.76

### **Maps**

- Mapbox GL 3.18.1
- react-map-gl 8.1.0

### **Utilities**

- date-fns 3.6.0
- clsx, tailwind-merge
- recharts 2.15.4

### **Development**

- Vitest 3.2.4
- ESLint 9.32.0
- TypeScript ESLint

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- CSS Grid, Flexbox
- CSS Custom Properties

---

## Future Considerations

1. **API Integration**: Currently uses static data; ready for API integration
2. **State Management**: Could add Zustand/Redux if needed
3. **Code Splitting**: Route-based code splitting with React.lazy
4. **PWA**: Service worker for offline support
5. **Analytics**: Ready for integration
6. **Internationalization**: i18n support can be added

---

## Development Workflow

1. **Start Development**: `npm run dev`
2. **Type Checking**: Built into Vite build
3. **Linting**: `npm run lint`
4. **Testing**: `npm test` or `npm run test:watch`
5. **Build**: `npm run build`
6. **Preview**: `npm run preview`

---

This tech stack provides a solid foundation for a modern, maintainable, and scalable React application with excellent developer experience and performance.
