import { useEffect } from 'react';

const useKeyboardShortcuts = ({
  onNextPage,
  onPrevPage,
  onFirstPage,
  onLastPage,
  onSort,
  sortBy,
  sortOrder,
  currentPage,
  totalPages,
  onFocusGoToPage
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Pagination shortcuts
      if (event.altKey) {
        switch (event.key) {
          case 'ArrowRight':
            event.preventDefault();
            if (currentPage < totalPages) {
              onNextPage();
            }
            break;
          case 'ArrowLeft':
            event.preventDefault();
            if (currentPage > 1) {
              onPrevPage();
            }
            break;
          case 'Home':
            event.preventDefault();
            onFirstPage();
            break;
          case 'End':
            event.preventDefault();
            onLastPage();
            break;
          case 'g':
          case 'G':
            event.preventDefault();
            onFocusGoToPage();
            break;
          // Sorting shortcuts
          case 'n':
          case 'N':
            event.preventDefault();
            onSort('name');
            break;
          case 'c':
          case 'C':
            event.preventDefault();
            onSort('category');
            break;
          case 'p':
          case 'P':
            event.preventDefault();
            onSort('price');
            break;
          case 's':
          case 'S':
            event.preventDefault();
            onSort('stock');
            break;
          case 't':
          case 'T':
            event.preventDefault();
            onSort('status');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onNextPage,
    onPrevPage,
    onFirstPage,
    onLastPage,
    onSort,
    currentPage,
    totalPages,
    onFocusGoToPage
  ]);
};

export default useKeyboardShortcuts; 