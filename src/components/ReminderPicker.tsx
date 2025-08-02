import { useState } from 'react';
import { Calendar, Clock, X, Bell } from 'lucide-react';

interface ReminderPickerProps {
  reminderDate?: string;
  reminderEnabled?: boolean;
  onSave: (reminderDate: string | null, enabled: boolean) => void;
  onClose: () => void;
}

export function ReminderPicker({ reminderDate, reminderEnabled, onSave, onClose }: ReminderPickerProps) {
  const [selectedDate, setSelectedDate] = useState(reminderDate ? reminderDate.split('T')[0] : '');
  const [selectedTime, setSelectedTime] = useState(
    reminderDate ? reminderDate.split('T')[1]?.slice(0, 5) || '09:00' : '09:00'
  );
  const [enabled, setEnabled] = useState(reminderEnabled || false);

  const handleSave = () => {
    if (!selectedDate || !enabled) {
      onSave(null, false);
    } else {
      const reminderDateTime = `${selectedDate}T${selectedTime}:00.000Z`;
      onSave(reminderDateTime, enabled);
    }
    onClose();
  };

  const handleQuickSet = (hours: number) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    setSelectedDate(now.toISOString().split('T')[0]);
    setSelectedTime(now.toTimeString().slice(0, 5));
    setEnabled(true);
  };

  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            Set Reminder
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Enable Reminder</span>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {enabled && (
            <>
              {/* Quick Actions */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Quick Set</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickSet(1)}
                    className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    1 Hour
                  </button>
                  <button
                    onClick={() => handleQuickSet(4)}
                    className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    4 Hours
                  </button>
                  <button
                    onClick={() => handleQuickSet(24)}
                    className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* Date Picker */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Time Picker */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  min={selectedDate === today ? currentTime : undefined}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            {enabled ? 'Set Reminder' : 'Remove Reminder'}
          </button>
        </div>
      </div>
    </div>
  );
}