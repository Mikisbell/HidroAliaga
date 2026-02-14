# Vercel React Best Practices Audit

## Executive Summary
The project uses a modern stack (Next.js 16, React 19) and follows several best practices, including dynamic imports for heavy components (`DesignerWrapper`, `WorkspaceSplitView`). However, a critical performance bottleneck was identified in the middleware, along with opportunities to improve data fetching and image optimization.

## 🚨 Critical Issues (Priority 1)

### 1. Middleware Waterfall
- **File**: `frontend/src/middleware.ts`
- **Issue**: `await supabase.auth.getUser()` is called on every request to protected routes. This performs a database call, adding significant latency to TTB (Time to First Byte).
- **Recommendation**: 
  - Use `supabase.auth.getSession()` for faster JWT validation in middleware (no DB call).
  - Defer full `getUser()` validation to Server Components or specific API routes where fresh user data is strictly required.

## ⚠️ Improvement Opportunities (Priority 2-4)

### 2. Client-Side Data Fetching
- **Observation**: Hand-rolled `fetch` and `useEffect` are used for data fetching (e.g., `api-services.ts`).
- **Risk**: This often leads to "request waterfalls" (fetching child data only after parent data loads) and race conditions.
- **Recommendation**: Adopt **SWR** or **TanStack Query**. These libraries handle deduplication, caching, and parallel fetching automatically.
  - *Ref: Rule `client-swr-dedup`*

### 3. Image Optimization
- **File**: `frontend/src/app/login/page.tsx`, `frontend/src/components/project-carousel.tsx`
- **Issue**: Standard `<img>` tags are used.
- **Recommendation**: Replace with `next/image` (`<Image />`) to automatically serve optimized formats (WebP/AVIF), lazy load, and prevent layout shifts.

### 4. Barrel Files
- **File**: `frontend/src/lib/engine/index.ts`
- **Issue**: Exports the entire `motor-hidraulico` module.
- **Recommendation**: While currently manageable (23KB), ensure this doesn't grow into a massive barrel file that breaks tree-shaking. Prefer direct imports for internal modules if this grows.

## ✅ Good Practices Identified
- **Dynamic Loading**: Correctly using `next/dynamic` for `WorkspaceSplitView` (React Flow) to avoid bloating the initial bundle.
- **Optimistic UI**: `DesignerWrapper.tsx` implements optimistic updates for node/pipe creation, making the UI feel instant.
- **Font Optimization**: `layout.tsx` correctly uses `next/font/google`.
