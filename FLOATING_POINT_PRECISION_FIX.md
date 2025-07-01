# Floating-Point Precision Fix

## Problem
The Figma Variable Explorer plugin was exporting number variables with excessive decimal precision (e.g., `0.1` became `0.10000000149011612`). This occurred due to JavaScript's floating-point representation issues when using `.toString()` on numbers.

## Root Cause
The issue was present in multiple locations where numeric values were converted to strings:

1. **Legacy version (`src/main.ts`)**: Line 80 used `value.toString()`
2. **New version (`src-2.0/helpers/variableResolverHelper.ts`)**: Line 124 used `value.toString()`
3. **JSON export (`src-2.0/helpers/figma-sds-helper.ts`)**: The `valueToJSON` function returned raw numeric values without rounding

## Solution
Applied a consistent rounding strategy to match Figma's internal precision handling:

### 1. Created a utility function to round numbers to Figma's precision (0.01):
```typescript
function roundNumberToFigmaPrecision(value: any): string {
  if (typeof value === 'number') {
    // Round to 2 decimal places to match Figma's precision (0.01)
    const rounded = Math.round(value * 100) / 100;
    // Remove unnecessary trailing zeros
    return rounded.toString();
  }
  return value.toString();
}
```

### 2. Updated the variable resolution functions:

**In `src-2.0/helpers/variableResolverHelper.ts`:**
- Modified `resolveVariableValue()` to use `roundNumberToFigmaPrecision()` instead of `value.toString()`

**In `src/main.ts` (legacy version):**
- Added inline number rounding logic in `getResolvedVariableValue()`

**In `src-2.0/helpers/figma-sds-helper.ts`:**
- Enhanced `valueToJSON()` to apply rounding for FLOAT type variables

## Benefits
- ✅ Numbers now export with clean precision (e.g., `0.1` instead of `0.10000000149011612`)
- ✅ Matches Figma's internal handling of numeric values
- ✅ Improves design token export accuracy for developer handoff
- ✅ Maintains backward compatibility
- ✅ Applied to both legacy and new versions of the plugin

## Testing
The plugin builds successfully with TypeScript type checking enabled, confirming all changes are syntactically correct and type-safe.

## Files Modified
1. `src/main.ts` - Legacy version number handling
2. `src-2.0/helpers/variableResolverHelper.ts` - New version variable resolution
3. `src-2.0/helpers/figma-sds-helper.ts` - JSON export precision handling