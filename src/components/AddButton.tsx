import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AddButtonProps {
  onAdd: (text: string) => void;
  placeholder: string;
  buttonText: string;
  className?: string;
}

export function AddButton({ onAdd, placeholder, buttonText, className = '' }: AddButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setText('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className={`bg-white rounded-xl p-4 shadow-lg border border-gray-200 ${className}`}>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500"
            rows={3}
            autoFocus
          />
          <div className="flex items-center space-x-3 mt-3">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
            >
              Add
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className={`group flex items-center justify-start space-x-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 p-3 rounded-xl transition-all duration-200 w-full ${className}`}
    >
      <Plus className="h-4 w-4" />
      <span className="font-medium">{buttonText}</span>
    </button>
  );
}