/**
 * Time formatting utilities
 * Converts ISO timestamps to human-readable relative time
 */

/**
 * Formats an ISO timestamp into dynamic relative text
 * Examples: "10m ago", "2 hrs ago", "1 day ago"
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const now = new Date();
  const past = new Date(isoTimestamp);
  const diffMs = now.getTime() - past.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return 'Just now';
  }
  
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  
  if (hours < 24) {
    return hours === 1 ? '1 hr ago' : `${hours} hrs ago`;
  }
  
  if (days < 7) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  
  return past.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Truncates text with ellipsis if it exceeds maxLength
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength - 3)}...`;
}
