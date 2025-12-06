type LastTwoDaysFileData = {
  "Article number": string
  "Done by": string
  [key: string]: unknown
}

const PORTAL_URL = "https://powertrack3.aptaracorp.com/AptaraVendorAPI/vendorWorkflow.html"
const LAST_TWO_DAYS_FILES_URL = "https://n8n-ex6e.onrender.com/webhook/last-two-days-files"
const FORM_DATA = "userName=NCXMLR&psw=NCXMLR123"

export async function fetchPortalHtml(): Promise<string> {
  const response = await fetch(PORTAL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Connection": "keep-alive",
    },
    body: FORM_DATA,
    cache: "no-store",
    keepalive: true,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch portal data: ${response.statusText}`)
  }

  return response.text()
}

export async function fetchLastTwoDaysFilesData(): Promise<LastTwoDaysFileData[]> {
  const response = await fetch(LAST_TWO_DAYS_FILES_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Connection": "keep-alive",
    },
    cache: "no-store",
    keepalive: true,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch last two days files data: ${response.statusText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

export function buildDoneByMap(lastTwoDaysFilesData: LastTwoDaysFileData[]): Map<string, string> {
  const doneByMap = new Map<string, string>()
  const len = lastTwoDaysFilesData.length

  for (let i = 0; i < len; i++) {
    const item = lastTwoDaysFilesData[i]
    if (
      item &&
      typeof item === "object" &&
      "Article number" in item &&
      "Done by" in item
    ) {
      const articleNumber = item["Article number"]
      const doneBy = item["Done by"]
      if (articleNumber && doneBy) {
        const num = typeof articleNumber === "string" ? articleNumber.trim() : String(articleNumber).trim()
        const by = typeof doneBy === "string" ? doneBy.trim() : String(doneBy).trim()
        if (num && by) {
          doneByMap.set(num, by)
        }
      }
    }
  }

  return doneByMap
}

