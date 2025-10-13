# Email Setup Instructions

## Gmail Configuration for Verification Emails

### 1. Create a Gmail Account (if needed)

Create a dedicated Gmail account for your Before We Go application, e.g., `beforewego.app@gmail.com`

### 2. Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to "Security"
3. Enable "2-Step Verification"

### 3. Generate App Password

1. In Google Account settings, go to "Security"
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" as the app and generate a password
4. Copy the 16-character app password (remove spaces)

### 4. Update Environment Variables

Update your `.env` file with your Gmail credentials:

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Email Configuration
FROM_EMAIL=your-email@gmail.com
FROM_NAME="Before We Go"
```

### 5. Example Configuration

```env
# Gmail SMTP Configuration
GMAIL_USER=beforewego.app@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# Email Configuration
FROM_EMAIL=beforewego.app@gmail.com
FROM_NAME="Before We Go - Time Capsule Letters"
```

## Features

### ✅ Real Email Verification

- Sends HTML-formatted verification emails
- 6-digit verification codes
- 15-minute code expiration
- Professional email templates

### ✅ Rate Limiting

- Maximum 3 verification emails per hour per email address
- Prevents spam and abuse

### ✅ Database Tracking

- All verification codes are stored in database
- Codes are marked as verified when used
- Expired codes are automatically cleaned up

### ✅ Resend Functionality

- Users can request new codes if not received
- Subject to same rate limiting rules

### ✅ Security Features

- Codes expire after 15 minutes
- Used codes cannot be reused
- Automatic cleanup of expired codes
- Email-specific verification

## Testing the Email System

1. **Set up Gmail credentials** in `.env` file
2. **Start the development server**: `pnpm dev`
3. **Navigate to registration**: `http://localhost:5173/register`
4. **Complete the flow**:
   - Enter name and graduation year
   - Enter school email (real email address)
   - Check your email for verification code
   - Enter the 6-digit code
   - Repeat for personal email
   - Create password and complete registration

## Email Templates

The system sends beautifully formatted HTML emails with:

- Professional branding
- Large, easy-to-read verification codes
- Clear instructions
- Branded header and footer
- Mobile-friendly design

## Error Handling

- **Invalid Gmail credentials**: Clear error message
- **Rate limiting**: User-friendly rate limit messages
- **Email sending failures**: Graceful fallback with helpful error messages
- **Invalid codes**: Clear validation messages

## Production Considerations

1. **Use a dedicated Gmail account** for the application
2. **Monitor email sending limits** (Gmail has daily sending limits)
3. **Consider upgrading to Gmail API** for higher volume
4. **Set up proper DNS/SPF records** if using custom domain
5. **Monitor delivery rates** and spam folder placement

## Troubleshooting

### Common Issues

1. **"Authentication failed"**: Check app password is correct
2. **"Rate limited"**: Wait an hour or check rate limiting logic
3. **Emails in spam**: Check email content and sender reputation
4. **Codes not working**: Verify database connection and code expiration

### Debug Mode

Set `NODE_ENV=development` to see verification codes logged to console for testing.
