# Reminder Feature Setup

## Database Migration Required

Before using the reminder feature, you need to run the following SQL in your Supabase project:

```sql
-- Add reminder fields to cards table
ALTER TABLE cards 
ADD COLUMN reminder_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN reminder_enabled BOOLEAN DEFAULT FALSE;

-- Create index for reminder queries
CREATE INDEX idx_cards_reminder_date ON cards(reminder_date);
CREATE INDEX idx_cards_reminder_enabled ON cards(reminder_enabled);
```

**Or run the migration file:**
```bash
# In Supabase SQL Editor, run:
# supabase/add_reminders_migration.sql
```

## Browser Permissions

The app will automatically request notification permissions when first loaded. Users can:

1. Allow notifications to receive reminder alerts
2. Deny notifications (reminders will still be tracked but no browser notifications)

## How to Use Reminders

1. **Set a Reminder**: Hover over a card and click the bell icon
2. **Quick Set**: Use "1 Hour", "4 Hours", or "Tomorrow" buttons  
3. **Custom Time**: Select specific date and time
4. **Visual Indicators**: Cards with active reminders show a clock icon and time remaining
5. **Notifications**: Browser notifications appear when reminders are due

## Features

- ✅ Visual bell/clock icons on cards
- ✅ Time remaining display (1h, 2d, etc.)
- ✅ Overdue indicators (red text)
- ✅ Browser notifications with sound
- ✅ Quick-set buttons for common timeframes
- ✅ Persistent reminders (stored in database)
- ✅ Auto-dismissing notifications