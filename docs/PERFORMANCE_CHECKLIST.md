# Performance Optimization Checklist

## Images
- Next.js `<Image>` with width/height
- Blur placeholders
- Lazy-load below the fold
- Cloudinary transformations (q_auto,f_auto)

## Code Splitting
- dynamic() for heavy components and modals
- Route-based splitting via App Router

## Fonts
- System fonts or optimized Google Fonts
- `display: swap`

## Bundle Size
- Use `@next/bundle-analyzer`
- Remove unused deps and tree-shake

## Database
- Proper indexes in Supabase
- Use pagination and limits
- Cache frequently-accessed data

## API
- Caching headers (where safe)
- React Query cache
- Debounce search
- Batch similar requests