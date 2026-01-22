// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress unhandled promise rejection errors from service workers
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.includes && event.reason.includes('no-response')) {
    event.preventDefault();
  }
});
