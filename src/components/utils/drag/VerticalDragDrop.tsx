import React, { useState, useRef, useEffect } from 'react';
import { Optional } from '../../../types/Optional';

import './VerticalDragDrop.css';

export interface PositionWrapper<T,> {
    index: number;
    item: T;
}

interface Position {
    real: number;
    view: number;
}

interface DragDropProps<T, K> extends React.HTMLAttributes<HTMLDivElement> {
    items: T[];
    parameters?: K;
    applyFilter?: (value: T) => boolean;
    onItemDrag?: (item: PositionWrapper<T>) => void;
    onItemDrop?: (item: PositionWrapper<T>) => void;
    onItemsChange: (items: PositionWrapper<T>[], parameters?: K) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    emptyTemplate?: React.ReactNode;
    beforeTemplate?: React.ReactNode;
    afterTemplate?: React.ReactNode;
    itemId: (item: T) => string | number;
}

export const VerticalDragDrop = <T, K>({ items, parameters, emptyTemplate, beforeTemplate, afterTemplate, applyFilter, onItemDrag, onItemDrop, onItemsChange, renderItem, itemId, ...rest }: DragDropProps<T, K>) => {
    const [wrappedItems, setWrappedItems] = useState<PositionWrapper<T>[]>([]);

    const [dragFormElement, setDragFormElement] = useState(false);

    const dragItemRef = useRef<PositionWrapper<T> | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    
    const [draggingPosition, setDraggingPosition] = useState<Optional<number>>(null);

    useEffect(() => {
        const result: PositionWrapper<T>[] = items.map((v, i) => ({
            index: i,
            item: v
        }));
        setWrappedItems(result)
    }, [items]);

    useEffect(() => {
        if (dragItemRef.current !== null) {
            const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
            const handleMouseUp = () => handleDragEnd();

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [dragItemRef.current]);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.preventDefault();

        if(dragFormElement || !containerRef.current || e.target != containerRef.current.children[index]) {
            return;
        }
        
        e.dataTransfer.effectAllowed = 'move';

        dragItemRef.current = wrappedItems[index];

        if(onItemDrag) {
            onItemDrag(dragItemRef.current);
        }

        setDraggingPosition(e.clientY - containerRef.current.getBoundingClientRect().top);
    };

    const handleDragMove = (e: MouseEvent) => {
        if (dragItemRef === null || draggingPosition === null || containerRef.current === null) {
            return;
        }

        const top = containerRef.current.getBoundingClientRect().top;
        const height = containerRef.current.getBoundingClientRect().height;
        const position = e.clientY - top;

        if(position < 0) {
            setDraggingPosition(0);
            return;
        }

        if(position > height) {
            setDraggingPosition(height);
            return;
        }

        setDraggingPosition(position);
    };

    const handleDragEnd = () => {
        if (!containerRef.current || !dragItemRef.current) {
            resetStatus();
            return;
        }

        if(onItemDrop) {
            onItemDrop(dragItemRef.current);
        }

        const from = dragItemRef.current.index;
        const to = calculateDrop().view;

        const newWrappedItems = [...wrappedItems];

        const item = newWrappedItems.splice(from, 1)[0];
        newWrappedItems.splice(to, 0, item);

        newWrappedItems.forEach((v, i) => v.index = i);

        onItemsChange(newWrappedItems, parameters);

        resetStatus();
    };

    const resetStatus = () => {
        dragItemRef.current = null;
        setDraggingPosition(null);
    }

    const calculateDrop = (): Position => {
        if (!containerRef.current || !dragItemRef.current) {
            return { real: 0, view: 0 };
        }

        const current = containerRef.current.children[dragItemRef.current.index] as HTMLElement;
        const actualPosition = current.getBoundingClientRect().y;

        let position = wrappedItems.length;
        let lastEnd = 0;
        let count = 0;
        for (const element of wrappedItems) {
            const index = element.index;
            if (index == dragItemRef.current.index) {
                continue;
            }

            const item = containerRef.current?.children[index] as HTMLElement;
            const itemRect = item.getBoundingClientRect();

            if (actualPosition >= lastEnd && actualPosition <= itemRect.top) {
                return { real: index, view: count };
            }

            if (actualPosition >= itemRect.top && actualPosition <= itemRect.bottom) {
                const mid = itemRect.top + ((itemRect.top - itemRect.bottom) / 2);
                if (actualPosition <= mid) {
                    return { real: index, view: count };
                }

                return { real: index + 1, view: count + 1 };
            }


            lastEnd = itemRect.bottom;
            count++;
        }

        return { real: position, view: position };
    };

    const isCursor = (index: number) => {
        return dragItemRef.current && dragItemRef.current.index === index && draggingPosition != null;
    }

    const calculateCursorPosition = (index: number) => {
        if(!isCursor(index) || draggingPosition == null) {
            return 0;
        }
        return draggingPosition - 20; // TODO: Fix position.
    }

    const isLandPosition = (index: number) => {
        if(dragItemRef.current == null) {
            return false;
        }
        return calculateDrop().real == index;
    }

    const isCurrentItem = (item: PositionWrapper<T>) => {
        if(!dragItemRef.current) {
            return false;
        }
        return itemId(dragItemRef.current.item) == itemId(item.item)
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const isFormElement = target.closest('input, textarea, button');
        setDragFormElement(!!isFormElement);
    };

    return (
        <div
            ref={containerRef}
            {...rest}
            className={`${ rest.className ? rest.className : "" } vertical-drag-container`}>
                {beforeTemplate && (
                    <>
                        { beforeTemplate }
                    </>
                )}
                {wrappedItems.length > 0 ? (
                    <>
                        {
                            wrappedItems.filter(e => applyFilter ? applyFilter(e.item) : true).map((item, index) => (
                                <div
                                    key={item.index}
                                    draggable
                                    onMouseDown={handleMouseDown}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    className={`vertical-drag-item ${ isCursor(index) && "cursor"}` }
                                    style={{
                                        top: calculateCursorPosition(index),
                                    }}>
                                    <div className={`landing-area ${ isLandPosition(index) && "show"} ${ isCurrentItem(item) && "original" }` }></div>
                                    {renderItem(item.item, index)}
                                    <div className={`landing-area ${ isLandPosition(index) && isCurrentItem(item) && "show original" }` }></div>
                                </div>
                            ))
                        }
                        <div className={`landing-area ${ isLandPosition(wrappedItems.length) && "show"}` }></div>
                    </>
                ) : emptyTemplate && (
                    <>
                        {emptyTemplate}
                    </>
                )}
                {afterTemplate && (
                    <>
                        { afterTemplate }
                    </>
                )}
        </div>
    );
};
