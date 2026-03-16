export function extractShareToken(sharePath: string | null | undefined) {
  if (!sharePath) {
    return null
  }

  const parts = sharePath.split('/').filter(Boolean)
  return parts.at(-1) ?? null
}

export function buildPublicProfilePreviewUrl(sharePath: string | null | undefined) {
  const shareToken = extractShareToken(sharePath)

  if (!shareToken) {
    return null
  }

  return `${window.location.origin}/profile/${shareToken}`
}

export async function copyTextToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const temporaryField = document.createElement('textarea')
  temporaryField.value = value
  temporaryField.setAttribute('readonly', 'true')
  temporaryField.style.position = 'absolute'
  temporaryField.style.left = '-9999px'
  document.body.appendChild(temporaryField)
  temporaryField.select()
  document.execCommand('copy')
  document.body.removeChild(temporaryField)
}

export function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}
