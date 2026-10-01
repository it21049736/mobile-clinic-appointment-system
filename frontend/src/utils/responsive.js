import { useWindowDimensions } from 'react-native';

// Content widths for large screens (web/tablet). On phones the screen is narrower, so these have no effect.
export const MAX_WIDTH = { page: 1100, content: 760, auth: 480 };

export const centered = (maxWidth) => ({ width: '100%', maxWidth, alignSelf: 'center' });

export const WIDE_BREAKPOINT = 768;

export const useResponsive = () => {
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;
  const columns = width >= 1100 ? 3 : isWide ? 2 : 1;
  return { width, isWide, columns };
};

// Style for one cell of a wrapping row grid (see gridRow) with the given column count.
export const gridCell = (columns) =>
  columns > 1 ? { width: `${100 / columns}%`, paddingHorizontal: 6 } : { width: '100%' };

export const gridRow = (columns) =>
  columns > 1 ? { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 } : null;
