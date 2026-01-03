# Adding Room Number Field - Remaining Steps

## ✅ Completed
1. Added `room_number TEXT` to database schema
2. Added `roomNumber?: string` to `Class` interface  
3. Added `roomNumber?: string` to `ClassFormData` interface

## 🔧 TODO - Manual Steps Required

### 1. Add database column (run this in PostgreSQL):
```sql
ALTER TABLE classes ADD COLUMN IF NOT EXISTS room_number TEXT;
```

### 2. Update Backend API (`server/index.ts`)

**POST /api/classes** (around line 269):
```typescript
const { name, language, level, teacherId, roomNumber, schedule } = req.body;
// In INSERT statement:
'INSERT INTO classes (class_id, name, language, level, teacher_id, room_number, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
[classId, name, language, level, teacherId, roomNumber, req.user.id]
```

**PUT /api/classes/:classId** (find and update):
```typescript
const { name, language, level, teacherId, roomNumber, schedule, studentIds } = req.body;
// In UPDATE statement:
'UPDATE classes SET name = $1, language = $2, level = $3, teacher_id = $4, room_number = $5 WHERE class_id = $6',
[name, language, level, teacherId, roomNumber, classId]
```

**GET /api/class-schedules** (around line 295):
```typescript
// Add room_number to SELECT:
SELECT cs.*, c.name as class_name, c.language, c.level, c.teacher_id, c.room_number
FROM class_schedules cs
JOIN classes c ON cs.class_id = c.class_id

// Add to events object:
events.push({
    id: `${schedule.id}-${current.toISOString().split('T')[0]}`,
    scheduleId: schedule.id,
    classId: schedule.class_id,
    title: schedule.class_name,
    language: schedule.language,
    level: schedule.level,
    teacherId: schedule.teacher_id,
    roomNumber: schedule.room_number,  // ADD THIS
    start: eventStart.toISOString(),
    end: eventEnd.toISOString(),
    dayOfWeek: dayOfWeek
});
```

### 3. Update ClassEditForm.tsx

Add room number field after teacherId (around line 163):
```tsx
</div>
<div>
  <label htmlFor="roomNumber" className="block text-sm font-medium text-slate-600 mb-1">Room Number</label>
  <input
    type="text" 
    id="roomNumber" 
    name="roomNumber"
    value={formData.roomNumber || ''}
    onChange={handleChange}
    placeholder="e.g., Room 201"
    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
  />
</div>
```

Update the initialData loading (around line 53):
```typescript
setFormData({
    name: initialData.name,
    language: initialData.language,
    level: initialData.level,
    teacherId: initialData.teacherId,
    roomNumber: initialData.roomNumber || '',  // ADD THIS
});
```

### 4. Update ClassSchedule.tsx - Event Display

Find the event component (around line 105-125) and update to show room number:
```tsx
const EventComponent = ({ event }: { event: ClassScheduleEvent }) => (
    <div className="p-1">
        <div className="font-semibold text-sm">{event.title}</div>
        <div className="text-xs opacity-90">
            {event.roomNumber && <div>📍 {event.roomNumber}</div>}
            <div>{event.level}</div>
        </div>
    </div>
);
```

Add this to the Calendar component:
```tsx
<Calendar
    // ... other props
    components={{
        event: EventComponent
    }}
/>
```

### 5. Better Event Spacing - Add to ClassSchedule.tsx

After imports, add inline styles:
```tsx
const calendarStyles = `
    .rbc-event {
        padding: 4px 6px !important;
        font-size: 0.75rem !important;
        line-height: 1.2 !important;
        overflow: hidden;
    }
    .rbc-event-content {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .rbc-time-slot {
        min-height: 45px;
    }
`;
```

Add in JSX before Calendar:
```tsx
<style>{calendarStyles}</style>
<Calendar ... />
```

## Testing
1. Edit a class and add a room number
2. Check timetable - room number should display
3. Events should be less cramped with better spacing
