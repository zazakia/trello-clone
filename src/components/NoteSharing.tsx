import { useState } from 'react';
import { Share2, Users, Mail, Copy, Check, X, Eye, Edit } from 'lucide-react';
import type { Note, NoteShare } from '../types';

interface NoteSharingProps {
  note: Note;
  shares: NoteShare[];
  onShare: (email: string, permission: 'view' | 'edit') => Promise<void>;
  onUnshare: (shareId: string) => Promise<void>;
  onUpdatePermission: (shareId: string, permission: 'view' | 'edit') => Promise<void>;
  onClose: () => void;
  className?: string;
}

export function NoteSharing({
  note,
  shares,
  onShare,
  onUnshare,
  onUpdatePermission,
  onClose,
  className = ''
}: NoteSharingProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSharing(true);
    try {
      await onShare(email.trim(), permission);
      setEmail('');
      setPermission('view');
    } catch (error) {
      console.error('Failed to share note:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/notes/${note.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleUnshare = async (shareId: string) => {
    if (confirm('Are you sure you want to remove access for this person?')) {
      await onUnshare(shareId);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Share2 className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Share Note</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Note Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h4 className="font-medium text-gray-900 truncate">
          {note.title || 'Untitled Note'}
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Share this note with team members to collaborate
        </p>
      </div>

      {/* Share Form */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleShare} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="view">Can view</option>
              <option value="edit">Can edit</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={sharing || !email.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{sharing ? 'Sharing...' : 'Share'}</span>
            </button>
            
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              title="Copy link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Shared With */}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="w-4 h-4 text-gray-400" />
          <h4 className="text-sm font-medium text-gray-900">
            Shared with ({shares.length})
          </h4>
        </div>

        {shares.length > 0 ? (
          <div className="space-y-2">
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {share.sharedWithEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {share.sharedWithEmail}
                    </p>
                    <p className="text-xs text-gray-500">
                      Shared {new Date(share.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={share.permission}
                    onChange={(e) => onUpdatePermission(share.id, e.target.value as 'view' | 'edit')}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="view">
                      <Eye className="w-3 h-3 inline mr-1" />
                      View
                    </option>
                    <option value="edit">
                      <Edit className="w-3 h-3 inline mr-1" />
                      Edit
                    </option>
                  </select>
                  
                  <button
                    onClick={() => handleUnshare(share.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove access"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">This note hasn't been shared yet</p>
            <p className="text-xs">Add email addresses above to start collaborating</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            <span className="font-medium">Note:</span> Shared users will receive email notifications
          </div>
          {copied && (
            <span className="text-green-600 font-medium">Link copied!</span>
          )}
        </div>
      </div>
    </div>
  );
}