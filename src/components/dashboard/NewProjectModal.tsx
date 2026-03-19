import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, author: string, logline?: string) => void;
}

export function NewProjectModal({ open, onClose, onCreate }: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [logline, setLogline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), author.trim(), logline.trim() || undefined);
    setTitle('');
    setAuthor('');
    setLogline('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="title"
          label="Title"
          placeholder="Untitled Screenplay"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <Input
          id="author"
          label="Author"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <TextArea
          id="logline"
          label="Logline (optional)"
          placeholder="A brief summary of your story..."
          value={logline}
          onChange={(e) => setLogline(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!title.trim()}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
