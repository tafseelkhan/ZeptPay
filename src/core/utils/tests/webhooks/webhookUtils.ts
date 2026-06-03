// utils/webhookUtils.ts
import { WebhookEvent } from '../../../types/WebhooksType';

// Check if an event is selected
export const isEventSelected = (
  selectedEvents: WebhookEvent[],
  eventName: string,
): boolean => {
  if (!selectedEvents || !Array.isArray(selectedEvents)) return false;

  for (const category of selectedEvents) {
    if (category?.events && Array.isArray(category.events)) {
      for (const event of category.events) {
        if (event?.name === eventName) return true;
      }
    }
  }
  return false;
};

// Toggle event in selection
export const toggleEventInSelection = (
  selectedEvents: WebhookEvent[],
  eventName: string,
  allCategories: WebhookEvent[],
): WebhookEvent[] => {
  if (!selectedEvents) selectedEvents = [];
  if (!allCategories) return selectedEvents;

  const isSelected = isEventSelected(selectedEvents, eventName);

  if (isSelected) {
    return selectedEvents
      .map(category => ({
        ...category,
        events: category.events?.filter(e => e?.name !== eventName) || [],
      }))
      .filter(category => category.events?.length > 0);
  } else {
    const sourceCategory = allCategories.find(cat =>
      cat.events?.some(e => e?.name === eventName),
    );

    if (!sourceCategory) return selectedEvents;

    const eventDetails = sourceCategory.events?.find(
      e => e?.name === eventName,
    );
    if (!eventDetails) return selectedEvents;

    const existingCategoryIndex = selectedEvents.findIndex(
      cat => cat?.category === sourceCategory.category,
    );

    if (existingCategoryIndex >= 0) {
      const newSelectedEvents = [...selectedEvents];
      newSelectedEvents[existingCategoryIndex] = {
        ...newSelectedEvents[existingCategoryIndex],
        events: [
          ...(newSelectedEvents[existingCategoryIndex].events || []),
          eventDetails,
        ],
      };
      return newSelectedEvents;
    } else {
      return [
        ...selectedEvents,
        {
          _id: sourceCategory._id,
          category: sourceCategory.category,
          category_display: sourceCategory.category_display,
          events: [eventDetails],
        },
      ];
    }
  }
};

// Validate URL
export const isValidUrl = (url: string): boolean => {
  const urlPattern =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return urlPattern.test(url);
};

// Validate local URL
export const isValidLocalUrl = (url: string): boolean => {
  const localPattern =
    /^(http:\/\/localhost|http:\/\/127\.0\.0\.1)(:\d+)?(\/.*)?$/;
  return localPattern.test(url);
};

// Get event categories summary
export const getEventCategoriesSummary = (
  eventCategories: WebhookEvent[],
): { category: string; eventCount: number }[] => {
  if (!eventCategories) return [];

  return eventCategories.map(category => ({
    category: category.category_display || category.category,
    eventCount: category.events?.length || 0,
  }));
};

// Filter events by search term
export const filterEventsBySearch = (
  eventCategories: WebhookEvent[],
  searchTerm: string,
): WebhookEvent[] => {
  if (!searchTerm.trim()) return eventCategories;

  const lowerSearchTerm = searchTerm.toLowerCase();

  return eventCategories
    .map(category => ({
      ...category,
      events:
        category.events?.filter(
          event =>
            event?.title?.toLowerCase().includes(lowerSearchTerm) ||
            event?.name?.toLowerCase().includes(lowerSearchTerm) ||
            event?.description?.toLowerCase().includes(lowerSearchTerm),
        ) || [],
    }))
    .filter(category => category.events.length > 0);
};
