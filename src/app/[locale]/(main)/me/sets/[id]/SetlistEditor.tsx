'use client';

import { useState, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { reorderSetlistItems, removeSongFromSetlist, updateSetlistItem } from '../actions';

export type SetlistItem = {
  id: string;
  position: number;
  key_override: string | null;
  capo_override: number | null;
  notes: string | null;
  song: {
    id: string;
    slug: string;
    title_hi: string | null;
    title_en: string | null;
    original_key: string | null;
  };
};

type SetlistEditorProps = {
  setlistId: string;
  initialItems: SetlistItem[];
};

function SortableItem({
  item,
  setlistId,
  onRemove,
}: {
  item: SetlistItem;
  setlistId: string;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [keyOverride, setKeyOverride] = useState(item.key_override ?? '');
  const [capoOverride, setCapoOverride] = useState(item.capo_override?.toString() ?? '');
  const [isPending, startTransition] = useTransition();

  function saveOverrides() {
    startTransition(async () => {
      await updateSetlistItem(item.id, setlistId, {
        key_override: keyOverride || null,
        capo_override: capoOverride ? parseInt(capoOverride, 10) : null,
      });
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3',
        isDragging && 'shadow-lg',
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        {item.song.title_hi && (
          <p className="font-[family-name:var(--font-devanagari)] text-sm font-medium truncate">
            {item.song.title_hi}
          </p>
        )}
        {item.song.title_en && (
          <p className="text-xs text-muted-foreground italic truncate">{item.song.title_en}</p>
        )}
        {item.song.original_key && (
          <p className="text-xs text-muted-foreground font-mono">{item.song.original_key}</p>
        )}
      </div>

      {/* Overrides */}
      <div className="flex items-center gap-2 shrink-0">
        <Input
          value={keyOverride}
          onChange={(e) => setKeyOverride(e.target.value)}
          onBlur={saveOverrides}
          placeholder="Key"
          className="h-7 w-14 text-xs font-mono"
          title="Key override"
        />
        <Input
          value={capoOverride}
          onChange={(e) => setCapoOverride(e.target.value)}
          onBlur={saveOverrides}
          placeholder="Capo"
          type="number"
          min={0}
          max={12}
          className="h-7 w-16 text-xs"
          title="Capo override"
        />
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
        aria-label="Remove from setlist"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SetlistEditor({ setlistId, initialItems }: SetlistEditorProps) {
  const [items, setItems] = useState(initialItems);
  const [isReordering, startReorder] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    startReorder(async () => {
      await reorderSetlistItems(setlistId, reordered.map((i) => i.id));
    });
  }

  function handleRemove(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    removeSongFromSetlist(itemId, setlistId);
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8 text-sm">
        No songs yet. Search and add songs below.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {isReordering && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Saving order…
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              setlistId={setlistId}
              onRemove={handleRemove}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
