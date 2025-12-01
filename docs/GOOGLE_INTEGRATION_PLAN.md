# Google Gmail & Calendar Integration Plan

## Overview
This document outlines the plan to integrate Google Gmail and Google Calendar/Meetings into the Property Management system, enabling property managers to seamlessly communicate with tenants and manage appointments directly from the platform.

## Goals
1. **Gmail Integration**: Send/receive emails, sync email threads, and manage tenant communications
2. **Calendar Integration**: Create meetings, schedule viewings, sync events, and send calendar invites
3. **Unified Communication Hub**: Centralize all tenant communications in one place
4. **Automated Workflows**: Auto-log emails as communications, sync calendar events

---

## Phase 1: Google OAuth Setup & Authentication

### 1.1 Backend Setup
**Tasks:**
- [ ] Set up Google Cloud Console project
- [ ] Enable Gmail API and Google Calendar API
- [ ] Create OAuth 2.0 credentials (Client ID & Secret)
- [ ] Configure OAuth scopes:
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/calendar`
  - `https://www.googleapis.com/auth/calendar.events`
- [ ] Add redirect URIs for OAuth callback
- [ ] Store OAuth credentials in environment variables

**Database Schema Changes:**
```prisma
model User {
  // ... existing fields
  googleEmail          String?
  googleAccessToken    String?  @db.Text
  googleRefreshToken   String?  @db.Text
  googleTokenExpiresAt DateTime?
  googleCalendarId     String?
  googleConnected      Boolean  @default(false)
  googleConnectedAt    DateTime?
}
```

**Files to Create/Modify:**
- `src/services/google/oauth.ts` - OAuth flow management
- `src/services/google/tokenManager.ts` - Token refresh logic
- `src/routes/google-auth/routes.ts` - OAuth endpoints
- `src/routes/google-auth/service.ts` - OAuth service

### 1.2 Frontend Setup
**Tasks:**
- [ ] Create Google OAuth connection UI
- [ ] Add "Connect Google" button in settings/profile
- [ ] Handle OAuth callback
- [ ] Display connection status
- [ ] Add disconnect functionality

**Files to Create/Modify:**
- `frontend/src/pages/SettingsPage.tsx` - Add Google connection section
- `frontend/src/components/google/GoogleConnection.tsx` - Connection UI
- `frontend/src/api/googleAuthService.ts` - Frontend API service

---

## Phase 2: Gmail Integration

### 2.1 Send Emails via Gmail
**Features:**
- Send emails directly from the communication system
- Use Gmail's SMTP/API instead of current email service
- Maintain email threading
- Track sent emails

**Backend Implementation:**
- [ ] `src/services/google/gmail.ts` - Gmail API wrapper
  - `sendEmail()` - Send email via Gmail API
  - `sendEmailWithThread()` - Send reply in thread
  - `getEmailThread()` - Get email conversation
- [ ] Update `src/routes/communications.ts` to use Gmail when connected
- [ ] Store Gmail message IDs for threading

**Database Schema:**
```prisma
model Communication {
  // ... existing fields
  gmailMessageId      String?  @unique
  gmailThreadId       String?
  gmailLabels         String[]
  isGmailSynced       Boolean  @default(false)
}
```

**Frontend Implementation:**
- [ ] Update SendEmailDialog to show Gmail option
- [ ] Display "Sent via Gmail" badge
- [ ] Show email thread view

### 2.2 Receive & Sync Emails
**Features:**
- Sync emails from Gmail inbox
- Auto-create communications from emails
- Filter emails by tenant email addresses
- Handle email attachments

**Backend Implementation:**
- [ ] `src/services/google/gmailSync.ts` - Email sync service
  - `syncInbox()` - Sync recent emails
  - `syncEmailThread()` - Sync specific thread
  - `processEmail()` - Convert email to communication
- [ ] Background job/cron to sync emails periodically
- [ ] Webhook setup for real-time email notifications (optional)

**Database Schema:**
```prisma
model EmailSync {
  id              String   @id @default(cuid())
  userId          String
  lastSyncAt      DateTime
  lastMessageId   String?
  syncStatus      String   // 'success', 'error', 'in_progress'
  errorMessage    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}
```

**Frontend Implementation:**
- [ ] Manual sync button
- [ ] Auto-sync status indicator
- [ ] Email sync history/logs

### 2.3 Email Threading
**Features:**
- Link related emails in threads
- Display conversation view
- Reply to emails maintaining thread

**Backend Implementation:**
- [ ] Thread detection logic
- [ ] Thread grouping in communications
- [ ] Reply functionality

**Database Schema:**
```prisma
model EmailThread {
  id              String   @id @default(cuid())
  gmailThreadId   String   @unique
  tenantId        String
  subject         String
  participants    String[]
  messageCount    Int      @default(0)
  lastMessageAt   DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  tenant       Tenant         @relation(fields: [tenantId], references: [id])
  communications Communication[]
}
```

---

## Phase 3: Google Calendar Integration

### 3.1 Create Calendar Events
**Features:**
- Create meetings/appointments from the system
- Schedule property viewings
- Schedule maintenance appointments
- Create lease signing meetings

**Backend Implementation:**
- [ ] `src/services/google/calendar.ts` - Calendar API wrapper
  - `createEvent()` - Create calendar event
  - `updateEvent()` - Update existing event
  - `deleteEvent()` - Delete event
  - `getEvent()` - Get event details
- [ ] Integration with existing calendar system
- [ ] Support for recurring events

**Database Schema:**
```prisma
model CalendarEvent {
  id                String   @id @default(cuid())
  googleEventId     String?  @unique
  title             String
  description       String?
  startTime         DateTime
  endTime           DateTime
  location          String?
  attendees         String[] // Email addresses
  eventType         String   // 'viewing', 'maintenance', 'meeting', 'lease_signing'
  relatedEntityType String?  // 'lease', 'work_order', 'tenant'
  relatedEntityId   String?
  isRecurring       Boolean  @default(false)
  recurrenceRule    String?
  googleCalendarId  String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}
```

**Frontend Implementation:**
- [ ] "Create Google Calendar Event" button in relevant pages
- [ ] Event creation dialog with Google Calendar option
- [ ] Calendar event form with attendees, location, etc.

### 3.2 Sync Calendar Events
**Features:**
- Sync existing Google Calendar events
- Display synced events in system calendar
- Two-way sync (optional)

**Backend Implementation:**
- [ ] `src/services/google/calendarSync.ts` - Calendar sync service
  - `syncCalendar()` - Sync events from Google Calendar
  - `processEvent()` - Convert Google event to system event
- [ ] Background job to sync calendar periodically
- [ ] Handle event updates/deletions

**Frontend Implementation:**
- [ ] Toggle to show/hide Google Calendar events
- [ ] Sync status indicator
- [ ] Manual sync button

### 3.3 Meeting Invites
**Features:**
- Send calendar invites to tenants
- Include meeting details and location
- Handle RSVPs (optional)

**Backend Implementation:**
- [ ] Add attendees to calendar events
- [ ] Send email invites via Gmail
- [ ] Track RSVP status

---

## Phase 4: Unified Communication Hub

### 4.1 Enhanced Communication View
**Features:**
- Show Gmail emails alongside manual communications
- Display email threads
- Show calendar events in timeline
- Filter by source (Gmail, Manual, Calendar)

**Frontend Implementation:**
- [ ] Update CommunicationList to show Gmail emails
- [ ] Thread view component
- [ ] Timeline view with calendar events
- [ ] Source badges (Gmail, Manual, Calendar)

### 4.2 Smart Features
**Features:**
- Auto-link emails to tenants by email address
- Suggest creating calendar event from email
- Auto-create communication from calendar event
- Email-to-calendar event conversion

**Backend Implementation:**
- [ ] Tenant email matching logic
- [ ] Smart suggestions service
- [ ] Auto-linking service

---

## Phase 5: Advanced Features

### 5.1 Email Templates with Gmail
**Features:**
- Use Gmail templates
- Rich HTML email support
- Email signatures
- Attachments support

### 5.2 Calendar Automation
**Features:**
- Auto-create events for lease renewals
- Auto-create events for maintenance schedules
- Recurring event support
- Event reminders

### 5.3 Analytics & Reporting
**Features:**
- Email response time tracking
- Meeting attendance tracking
- Communication volume by channel
- Calendar utilization metrics

---

## Technical Implementation Details

### Backend Architecture

#### Google Service Layer
```
src/services/google/
├── oauth.ts              # OAuth flow
├── tokenManager.ts       # Token refresh
├── gmail.ts              # Gmail API wrapper
├── gmailSync.ts          # Email sync logic
├── calendar.ts           # Calendar API wrapper
├── calendarSync.ts       # Calendar sync logic
└── types.ts              # TypeScript types
```

#### API Routes
```
src/routes/
├── google-auth/
│   ├── routes.ts         # OAuth endpoints
│   └── service.ts        # OAuth service
├── google/
│   ├── gmail/
│   │   ├── routes.ts     # Gmail endpoints
│   │   └── service.ts    # Gmail service
│   └── calendar/
│       ├── routes.ts     # Calendar endpoints
│       └── service.ts    # Calendar service
```

### Frontend Architecture

#### Components
```
frontend/src/
├── components/google/
│   ├── GoogleConnection.tsx      # Connection UI
│   ├── GmailSyncStatus.tsx       # Sync status
│   ├── CalendarSyncStatus.tsx    # Calendar sync
│   └── EmailThreadView.tsx       # Thread display
├── pages/
│   └── SettingsPage.tsx           # Google settings
└── api/
    ├── googleAuthService.ts       # Auth API
    ├── gmailService.ts            # Gmail API
    └── calendarService.ts          # Calendar API
```

### Dependencies

**Backend:**
```json
{
  "googleapis": "^128.0.0",
  "google-auth-library": "^9.0.0"
}
```

**Frontend:**
- No additional dependencies (use existing API client)

---

## Security Considerations

1. **Token Storage**
   - Store refresh tokens securely (encrypted)
   - Never expose access tokens to frontend
   - Implement token rotation

2. **OAuth Security**
   - Use PKCE for OAuth flow
   - Validate state parameter
   - Secure redirect URIs

3. **API Security**
   - Rate limiting on sync endpoints
   - Validate user permissions
   - Audit logging for Google API calls

4. **Data Privacy**
   - Only sync emails/events for connected accounts
   - Allow users to disconnect anytime
   - Clear data on disconnect (optional)

---

## Implementation Phases & Timeline

### Phase 1: OAuth Setup (Week 1-2)
- Google Cloud Console setup
- OAuth implementation
- Database schema updates
- Basic connection UI

### Phase 2: Gmail Send (Week 3-4)
- Gmail API integration
- Send email functionality
- Email threading basics
- Update communication system

### Phase 3: Gmail Sync (Week 5-6)
- Email sync service
- Background sync job
- Auto-create communications
- Email thread view

### Phase 4: Calendar Create (Week 7-8)
- Calendar API integration
- Create events functionality
- Meeting invites
- Integration with existing calendar

### Phase 5: Calendar Sync (Week 9-10)
- Calendar sync service
- Display synced events
- Two-way sync (optional)

### Phase 6: Polish & Testing (Week 11-12)
- UI/UX improvements
- Error handling
- Testing
- Documentation

---

## Success Metrics

1. **Adoption Rate**: % of property managers connecting Google
2. **Email Volume**: Number of emails sent via Gmail
3. **Sync Accuracy**: % of emails correctly linked to tenants
4. **Calendar Usage**: Number of events created
5. **Time Saved**: Reduction in manual communication logging

---

## Future Enhancements

1. **Microsoft Outlook Integration**: Similar integration for Outlook/Exchange
2. **Slack Integration**: Team communication integration
3. **SMS Integration**: Text message support
4. **AI Features**: 
   - Email summarization
   - Smart reply suggestions
   - Auto-categorization
5. **Mobile App**: Push notifications for emails/events
6. **Webhooks**: Real-time email/calendar updates

---

## Questions to Consider

1. **Multi-account Support**: Should managers be able to connect multiple Google accounts?
2. **Team Sharing**: Should team members see each other's Google emails/events?
3. **Tenant Access**: Should tenants be able to connect their Google accounts?
4. **Data Retention**: How long to keep synced email/calendar data?
5. **Sync Frequency**: Real-time vs. periodic sync?

---

## Next Steps

1. Review and approve this plan
2. Set up Google Cloud Console project
3. Create database migration for new fields
4. Start with Phase 1 (OAuth Setup)
5. Iterate through phases with testing at each stage


