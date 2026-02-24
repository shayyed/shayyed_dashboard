import React, { useState } from 'react';

interface DragDropItem {
  id: string;
  [key: string]: any;
}

interface DragDropListProps<T extends DragDropItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function DragDropList<T extends DragDropItem>({
  items,
  onReorder,
  renderItem,
  className = '',
}: DragDropListProps<T>) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(items[index].id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedItem === null) return;

    const dragIndex = items.findIndex((item) => item.id === draggedItem);
    if (dragIndex === -1 || dragIndex === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    onReorder(newItems);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`cursor-move transition-all ${
            draggedItem === item.id ? 'opacity-50' : ''
          } ${
            dragOverIndex === index ? 'border-t-2 border-[#111111]' : ''
          }`}
        >
          <div className="flex items-center gap-2 p-2 bg-white border border-[#E5E5E5] rounded-md hover:bg-[#F7F7F7]">
            <div className="text-[#666666] cursor-grab">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>
            <div className="flex-1">{renderItem(item, index)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
