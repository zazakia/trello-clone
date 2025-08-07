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
      <div className={`card p-4 ${className}`}>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="input w-full resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              type="submit"
              className="btn-primary px-4 py-2 font-medium"
            >
              Add
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary p-2"
              aria-label="Cancel adding"
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
      className={`btn-secondary w-full flex items-center justify-start gap-2 p-3 ${className}`}
    >
      <Plus className="h-4 w-4" />
      <span className="font-medium">{buttonText}</span>
    </button>
  );
}