/**
 * Emails components exports
 * 
 * Components are organized into subfolders:
 * - dialogs/ - Dialog components
 * - views/ - View components (desktop/mobile)
 * - list/ - List components
 * - viewer/ - Viewer components
 * 
 * @module components/emails
 */

// Main content component
export { EmailsContent } from "./emails-content"

// List components
export { EmailList } from "./list/email-list"

// Viewer components
export { EmailViewer } from "./viewer/email-viewer"
export { EmailViewerHeader } from "./viewer/email-viewer-header"
export { EmailIframe } from "./viewer/email-iframe"

// View components
export { EmailsMobileView } from "./views/emails-mobile-view"
export { EmailsDesktopView } from "./views/emails-desktop-view"

// Other components
export { EmailFilterPanel } from "./email-filter-panel"
export { EmailsLoadingSkeleton } from "./emails-loading-skeleton"

// Dialogs
export { EmailArticlesPreviewDialog } from "./dialogs/email-articles-preview-dialog"
