/**
 * Portal Constants
 * 
 * Constants for portal API URLs and configuration
 * 
 * @module lib/constants/portal-constants
 */

/**
 * Portal API base URL
 */
export const PORTAL_BASE_URL = "https://powertrack3.aptaracorp.com/AptaraVendorAPI"

/**
 * Portal workflow HTML endpoint
 */
export const PORTAL_WORKFLOW_URL = `${PORTAL_BASE_URL}/vendorWorkflow.html`

/**
 * Portal login credentials (form data)
 */
export const PORTAL_LOGIN_CREDENTIALS = "userName=NCXMLR&psw=NCXMLR123"

/**
 * Portal download file endpoint parameters
 */
export const PORTAL_DOWNLOAD_PARAMS = {
  ipaddress: "powertrack3.aptaracorp.com",
  username: "cedit",
  password: "cedit",
  basepath: "/CEFTP/VEND/XMLREVIEW",
  clientid: "1722",
} as const

/**
 * Build portal download URL for a given article ID
 * 
 * @param articleId - Article ID to download
 * @returns Complete download URL
 */
export function buildPortalDownloadUrl(articleId: string): string {
  const params = new URLSearchParams({
    clientReference: articleId,
    ipaddress: PORTAL_DOWNLOAD_PARAMS.ipaddress,
    username: PORTAL_DOWNLOAD_PARAMS.username,
    password: PORTAL_DOWNLOAD_PARAMS.password,
    basepath: PORTAL_DOWNLOAD_PARAMS.basepath,
    clientid: PORTAL_DOWNLOAD_PARAMS.clientid,
  })
  
  return `${PORTAL_BASE_URL}/downloadfile.html?${params.toString()}`
}

