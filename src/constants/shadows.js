// BeanLog Design System - Shadows (v0.1)
// Consistent shadow styles for cards and elevated elements

export default {
  // Card shadow - for content cards (cafe items, review items, profile cards)
  card: {
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
  },

  // Light shadow - for subtle elevation (stats cards, form sections)
  light: {
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
  },

  // Header shadow - for fixed headers and filters
  header: {
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 5,
  },
};
