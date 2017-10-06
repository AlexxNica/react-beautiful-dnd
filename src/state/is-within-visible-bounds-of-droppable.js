// @flow
import isWithin from './is-within';
import { subtract } from './position';
import { addPosition, offset } from './spacing';
import type {
  Position,
  DraggableDimension,
  DroppableDimension,
  DimensionFragment,
  Spacing,
} from '../types';

const noPadding: Position = { x: 0, y: 0 };

const getVisibleBounds = (
  droppable: DroppableDimension,
  padding: Position = noPadding
): Spacing => {
  const { scroll, bounds: containerBounds } = droppable.container;
  // Calculate the mid-drag scroll ∆ of the scroll container
  const containerScrollDiff: Position = subtract(scroll.initial, scroll.current);

  // Calculate the droppable's bounds, accounting for the container's scroll
  const droppableBounds: Spacing = offset(droppable.page.withMargin, containerScrollDiff);

  // Clip the droppable's bounds by the scroll container's bounds
  // This gives us the droppable's true visible area
  // Note: if the droppable doesn't have a scroll parent droppableBounds === container.page
  const clippedBounds: Spacing = {
    top: Math.max(droppableBounds.top, containerBounds.top),
    right: Math.min(droppableBounds.right, containerBounds.right),
    bottom: Math.min(droppableBounds.bottom, containerBounds.bottom),
    left: Math.max(droppableBounds.left, containerBounds.left),
  };

  const includingPadding = addPosition(clippedBounds, padding);

  return includingPadding;
};

const isPointWithin = (bounds: Spacing) => {
  // console.log(bounds);
  const isWithinHorizontal = isWithin(bounds.left, bounds.right);
  const isWithinVertical = isWithin(bounds.top, bounds.bottom);

  return (point: Position): boolean => (
    isWithinHorizontal(point.x) &&
    isWithinVertical(point.y)
  );
};

export const isPointWithinDroppable = (
  droppable: DroppableDimension,
  padding: Position = noPadding
) => (
  isPointWithin(getVisibleBounds(droppable, padding))
);

export const isDraggableWithin = (bounds: Spacing) => {
  const { top, right, bottom, left } = bounds;

  // There are some extremely minor inaccuracy in the calculations of margins (~0.001)
  // To allow for this inaccuracy we make the dimension slightly bigger for this calculation
  const isWithinHorizontal = isWithin(left - 1, right + 1);
  const isWithinVertical = isWithin(top - 1, bottom + 1);

  return (draggable: DraggableDimension): boolean => {
    const fragment: DimensionFragment = draggable.page.withMargin;

    return isWithinHorizontal(fragment.left) &&
      isWithinHorizontal(fragment.right) &&
      isWithinVertical(fragment.top) &&
      isWithinVertical(fragment.bottom);
  };
};
