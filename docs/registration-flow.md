# Multistep Registration Flow

## Overview

The registration flow is a 4-step progressive enhancement form that works without JavaScript but provides a smooth, modern experience when JS is enabled.

## Features

### 1. **Progressive Enhancement**

- ✅ Works without JavaScript (full form submission)
- ✅ Enhanced with JS for smooth step transitions
- ✅ No page reloads between steps when JS is enabled

### 2. **Session Storage Persistence**

- Step progress is saved to `sessionStorage` under the key `registration_progress`
- Users can refresh the page and return to their current step
- Clear button at the bottom allows users to start over

### 3. **Visual Progress Indicator**

- Chunked progress bar showing completion percentage
- 4 numbered circles indicating each step
- Smooth animations and transitions

### 4. **Step-by-Step Validation**

- **Step 1**: Basic Info (Name, Graduation Year)
- **Step 2**: School Email (verified against existing users)
- **Step 3**: Personal Email (verified against existing users)
- **Step 4**: Password (with confirmation matching)

### 5. **Effect-ts Integration**

- Uses Remote Functions for progressive enhancement
- Server-side validation with Effect
- Proper error handling and type safety

## File Structure

```tree
src/routes/register/
├── +page.svelte           # Main registration UI component
├── form.remote.ts         # Remote function with Effect for server-side processing
└── +page.server.ts        # (Optional) Additional server actions if needed
```

## How It Works

### Client-Side (`+page.svelte`)

1. **Step Management**
   - `currentStep` state variable (1-4)
   - Saved to sessionStorage on each step change
   - Loaded from sessionStorage on mount

2. **Form Structure**
   - Single form with conditional rendering based on `currentStep`
   - All fields are part of the same remote form
   - Steps 1-3 prevent default and advance manually
   - Step 4 submits the full form

3. **Progressive Enhancement**
   - Form has `onsubmit` handler only for steps 1-3
   - Step 4 uses natural form submission via the remote function
   - Without JS, all fields show and form submits normally

### Server-Side (`form.remote.ts`)

1. **Combined Schema**
   - All four steps are part of one `FullRegistration` schema
   - Uses Effect Schema for validation
   - Password confirmation checked server-side

2. **Registration Process**

   ```typescript
   1. Validate all fields
   2. Check school email uniqueness
   3. Check personal email uniqueness
   4. Hash password with Argon2
   5. Extract school domain
   6. Create user record
   7. Create session
   8. Set session cookie
   9. Redirect to profile edit page
   ```

3. **Security**
   - Passwords hashed with Argon2id
   - Email uniqueness checked
   - Session tokens generated securely
   - CSRF protection via SvelteKit

## UI/UX Design

### Color Scheme

- Gradient background: `from-blue-50 to-indigo-100`
- Primary buttons: `from-blue-600 to-indigo-600`
- Success button (final step): `from-green-600 to-emerald-600`
- White cards with shadows for content

### Progress Bar

- Full-width bar showing percentage
- Smooth 500ms transitions
- Numerical indicators for each step
- Step labels: "Basic Info", "School Email", "Personal Email", "Password"

### Form Inputs

- Large, accessible input fields
- Clear labels and placeholders
- Inline error messages in red
- Focus states with blue rings
- Smooth transitions on all interactions

### Navigation

- "Back" button (steps 2-4)
- "Continue" button (steps 1-3)
- "Create Account" button (step 4)
- "Clear saved progress" link at bottom

## Session Storage Schema

```json
{
  "step": 1,
  "name": "John Doe",
  "graduationYear": 2025,
  "schoolEmail": "john@school.edu",
  "personalEmail": "john@email.com"
}
```

Note: Passwords are never stored in session storage for security.

## Integration with Existing Auth System

The registration flow follows the same patterns as the login system:

1. Uses the same `auth.ts` functions:
   - `generateSessionToken()`
   - `createSession()`
   - `setSessionTokenCookie()`

2. Creates user with proper schema:
   - Placeholder images for `profilePicture` and `favoriteMemoryPhoto`
   - Status set to `PENDING_VERIFICATION`
   - Role defaults to `USER`

3. Redirects to profile edit page for users to:
   - Upload their photos
   - Add music preferences
   - Complete their profile

## Accessibility

- ✅ Keyboard navigation
- ✅ Focus visible states
- ✅ ARIA-compliant form structure
- ✅ Screen reader friendly
- ✅ High contrast error messages
- ✅ Clear label-input associations

## Browser Support

- Modern browsers with ES2020+ support
- sessionStorage API required for progress persistence
- Graceful degradation for older browsers (form still works)

## Testing Checklist

- [ ] Form works without JavaScript
- [ ] Form works with JavaScript
- [ ] Progress persists across page refreshes
- [ ] Clear button resets form
- [ ] Email uniqueness validation works
- [ ] Password matching validation works
- [ ] Session created after registration
- [ ] User redirected to profile edit
- [ ] Responsive design on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

## Future Enhancements

1. **Email Verification**
   - Send verification emails to both addresses
   - Prevent login until verified
   - Resend verification option

2. **Profile Picture Upload**
   - Allow upload during registration (step 5)
   - Image cropping/resizing
   - Preview before upload

3. **School Domain Validation**
   - Whitelist of allowed school domains
   - Auto-detect school from domain
   - Show school logo/colors

4. **Password Strength Meter**
   - Visual indicator
   - Suggestions for stronger passwords
   - Minimum requirements display

5. **Social Registration**
   - Google OAuth
   - Microsoft (for .edu accounts)
   - Apple Sign In

## Known Limitations

1. **Session Storage**
   - Limited to ~5-10MB
   - Cleared when browser/tab closes
   - Not shared across tabs

2. **Progressive Enhancement**
   - Requires JavaScript for smooth step transitions
   - No-JS users see all fields at once

3. **Validation**
   - Client-side validation is basic
   - Server-side validation is authoritative
   - Network delays may cause UX friction

## Related Files

- `/src/lib/schemas/register.ts` - Registration schemas
- `/src/lib/schemas/email.ts` - Email validation schema
- `/src/lib/schemas/password.ts` - Password validation schema
- `/src/lib/server/auth.ts` - Authentication utilities
- `/src/lib/server/form.ts` - Remote form helper
- `/src/lib/server/db/schema.ts` - Database schema
- `/src/hooks.server.ts` - Session validation hook
