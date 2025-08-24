# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run build` - Build the plugin with typecheck and minification
- `npm run watch` - Build in watch mode with typecheck for development

## Project Structure

This is a Figma plugin built with the `@create-figma-plugin` framework. The project has two versions:

- **Legacy version**: `src/` (being phased out)
- **Current version**: `src-2.0/` (primary development focus)

### Architecture Overview

The plugin follows a dual-context architecture with main thread (Figma API) and UI thread (Preact/React) communication:

**Main Thread** (`src-2.0/main.ts`):
- Handles Figma API interactions
- Extracts variable collections and modes
- Processes variable data and resolves aliases
- Emits processed data to UI thread via event handlers

**UI Thread** (`src-2.0/ui.tsx` → `src-2.0/PluginUI.tsx`):
- Preact-based UI with React compatibility layer
- Context-driven state management
- Responsive plugin interface with resizable window

### Context Architecture

The application uses multiple React contexts for state management:

1. **VariablesContext** - Central data store for variable collections, handles API communication
2. **ConfigurationContext** - View mode settings (table/css/json), color resolution, column widths
3. **SearchContext** - Search functionality across variables
4. **ThemeContext** - Theme switching between light/dark modes

### Key Data Flow

1. UI requests variables via `emit<GetVariableHandler>("GET_VARIABLES")`
2. Main thread processes Figma variables and collections
3. Data enriched with resolved aliases and formatted values
4. Results sent back via `emit("DONE", data)`
5. Context providers update React state and trigger re-renders

### View Modes

- **Table View**: Resizable columns, filtered search, alias navigation
- **CSS View**: CSS custom properties format 
- **JSON View**: Structured JSON with metadata

### Component Structure

- `components/` - Reusable UI components (modals, popovers, icons)
- `screens/` - Main application screens (Variables, Export, Configuration)
- `helpers/` - Data transformation utilities (CSS conversion, JSON export)
- `contexts/` - React context providers for state management

### Plugin Configuration

The plugin is configured via `package.json` under `figma-plugin` section with dual entry points for both legacy and new versions.

### Export Functionality

Supports exporting variables in multiple formats:
- JSON with collection metadata
- CSS custom properties
- Markdown documentation

Export can be scoped to all collections or active collection only.

### Additional things to keep in mind

- If required, create planning and task tracking related docs in @planning-docs folder
- For a functionality if a well-established public library available, use that instead of writing everything from scratch. Use Context7 to get latest documentation of that library