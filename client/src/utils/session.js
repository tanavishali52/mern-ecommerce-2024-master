/**
 * Utility to manage guest session ID
 */
export const getSessionId = () => {
  let sessionId = localStorage.getItem('guestSessionId');
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('guestSessionId', sessionId);
  }
  return sessionId;
};
