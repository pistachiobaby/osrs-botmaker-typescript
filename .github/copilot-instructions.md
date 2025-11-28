# Copilot Instructions for OSRS Botmaker TypeScript

## Project Overview

**Purpose**: TypeScript development environment for creating bot scripts for Sox's Botmaker, a RuneLite plugin. Scripts run in Rhino (Java's JavaScript engine), requiring careful transpilation and bundling.

**Key Outputs**: Each folder in `src/` becomes a standalone `.js` file in `dist/` via Rollup + TypeScript + Babel (ES5 target for Rhino 1.7.14).

---

## Architecture: State Machines for Bot Behavior

### Core Pattern
The codebase revolves around **strongly-typed finite state machines** defined in `src/state-machine.ts`. Every bot behavior is modeled as states with transitions, handlers, and a shared context.

**Why**: Games require reactive, tick-based logic. State machines prevent spaghetti code and provide compile-time safety for state transitions.

### How to Use StateMachine

1. **Define states as a const object** (example from `src/botato-thieving-food/behaviours/cooking/index.ts`):
   ```typescript
   export const CookingState = {
     FindCookingSource: 'Cooking.FindCookingSource',
     WalkToCookingSource: 'Cooking.WalkToCookingSource',
     CookAtSource: 'Cooking.CookAtSource',
   } as const;
   ```

2. **Create a StateConfig for each state** using the builder pattern or `defineStateConfig`:
   - `transitions`: tuple of allowed next states (enforced at compile time)
   - `onEnter(ctx, payload)`: called when entering the state
   - `onTick(ctx)`: called every game tick; return:
     - `void | number`: stay in state (number = ticks to wait)
     - `[NextState, payload]`: transition with payload
   - `onExit(ctx)`: cleanup when leaving

3. **Instantiate StateMachine** with state definitions, initial state, and context:
   ```typescript
   new StateMachine(defineStates({...}), 'InitialState', contextObject)
   ```

4. **Call `sm.tick()`** on every game tick (see `onGameTick()` in `src/botato-thieving-food/index.ts`)

### Context Pattern
Each state machine maintains a `context` object—shared mutable state across all states. Example: `CookingContext` tracks `lastInteractionTick` to avoid rapid re-interactions.

---

## Project Structure

```
src/
  state-machine.ts          # Core FSM library (strongly-typed)
  utils.ts                  # Helper functions (e.g., isPlayerBusy)
  botato-thieving-food/
    index.ts                # Entrypoint; instantiates StateMachine, exports game hooks
    overlay.ts              # RuneLite UI overlay for debugging
    behaviours/
      cooking/index.ts      # Sub-state machine for cooking behavior
      thieving/index.ts     # Sub-state machine for thieving behavior

dist/                       # Build output (one .js per src folder)
tests/                      # Vitest unit tests
```

### Script Entrypoints
Each `src/<script-name>/index.ts` must export these game hook functions (called by Botmaker):
- `onStart()`: called when bot starts
- `onEnd()`: called when bot stops
- `onGameTick()`: called every game tick (60 Hz)
- `onNpcAnimationChanged(npc)`: NPC animation events
- `onActorDeath(actor)`: actor death events
- `onHitsplatApplied(actor, hitsplat)`: hitsplat events

The main state machine should call `sm.tick()` in `onGameTick()`.

---

## Build Process

**Commands**:
- `pnpm build`: Single build pass
- `pnpm watch`: Continuous rebuild (use during development)
- `pnpm test`: Run Vitest tests

**Pipeline** (`rollup.config.js`):
1. TypeScript compiler transforms `.ts` to ESNext `.js`
2. Rollup bundles and resolves dependencies
3. Babel transpiles to ES5 for Rhino 1.7.14 compatibility
4. Custom plugins remove `export {}` statements (Botmaker expects no module wrappers)

**Output**: `dist/<FOLDER_NAME>.js` per `src/<FOLDER_NAME>/index.ts`

---

## Key Conventions & Patterns

### 1. State Naming
- Use dotted paths: `'Cooking.FindCookingSource'` (not just `'FindCookingSource'`)
- Helps with debugging and organizing hierarchical behavior trees

### 2. Payload for State Transitions
- Include `payload?: (payload: P) => void` in `StateConfig` to establish the expected payload type
- The SM enforces type matching at compile time: only transition with correct payload type
- Use `undefined` for states with no payload: `switch('NextState', undefined)`

### 3. Context Over Parameters
- Keep all shared state in the StateMachine's `context` object, not scattered across closures
- Access via `sm.ctx` after instantiation or inside state handlers

### 4. Overlay for Debugging
- Use `setCurrentOverlayStateText(text)` and `setOverlayNextStateText(text)` to update the RuneLite overlay
- Essential for tracking state transitions during testing

### 5. Timeout Mechanism
- Return a `number` from `onTick()` to pause the state for N ticks (useful for waiting for animations)
- Example: `return 5;` pauses 5 ticks before next tick handler runs

### 6. Hierarchical State Machines
- Compose sub-state machines: e.g., cooking has its own `StateMachine` with cooking-specific states
- Main state machine can transition to a "Cooking" state that manages the cooking sub-machine
- See `botato-thieving-food/behaviours/cooking/index.ts` for pattern

---

## Bundled Global Variables

When scripts run in Botmaker/Rhino, these globals are available:
- `bot`: Botmaker API for logging and control
- `client`: RuneLite client API for game data
- `net.runelite.*`: Full RuneLite API (NPCs, actors, overlays, etc.)

Reference type definitions in `@deafwave/osrs-botmaker-types` (external dependency).

---

## Testing

- Use Vitest (see `pnpm test`)
- Tests in `tests/**/*.spec.ts`
- Example: `tests/state-machine.spec.ts` tests FSM instantiation and transitions
- Unit test state handlers independently; focus on transition logic and payload types

---

## Common Tasks

| Task | Files to Edit |
|------|---------------|
| Add a new state to existing behavior | `src/botato-thieving-food/behaviours/{behaviour}/index.ts`, create state file in `states/` |
| Add game hook handler | `src/botato-thieving-food/index.ts` |
| Create new script | Create `src/{script-name}/index.ts` with state machine and game hooks |
| Add shared utility | `src/utils.ts` |
| Debug state transitions | Use overlay text functions + `bot.printLogMessage()` |

---

## Type Safety & Compiler Strictness

- `tsconfig.json` extends `@tsconfig/strictest` and `@tsconfig/node20`
- Strict mode is enforced; AI should never disable checks without strong justification
- StateMachine typing ensures invalid transitions are **compile-time errors**, not runtime bugs
- Always include type annotations for context, state names, and payloads
