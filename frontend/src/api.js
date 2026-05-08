const JSON_HEADERS = {
  'Content-Type': 'application/json',
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: JSON_HEADERS,
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    if (payload && typeof payload === 'object' && 'error' in payload) {
      const details =
        typeof payload.details === 'string' && payload.details.trim().length > 0
          ? ` ${payload.details}`
          : ''
      throw new Error(`${payload.error}${details}`)
    }
    throw new Error(typeof payload === 'string' ? payload : 'Request failed.')
  }

  return payload
}

export async function fetchAuthUser() {
  return request('/api/auth/me')
}

export async function login(body) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function register(body) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function logout() {
  return request('/api/auth/logout', {
    method: 'POST',
  })
}

export async function fetchPublicStudySets() {
  return request('/api/study-sets')
}

export async function fetchRandomPublicStudySets(limit = 3) {
  return request(`/api/study-sets/random?limit=${limit}`)
}

export async function fetchMyStudySets() {
  return request('/api/my/study-sets')
}

export async function fetchStudySetDetail(studySetId) {
  return request(`/api/study-sets/${studySetId}`)
}

export async function downloadStudySetTxt(studySetId) {
  const response = await fetch(`/api/study-sets/${studySetId}/download`, {
    credentials: 'include',
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    const payload = contentType.includes('application/json') ? await response.json() : await response.text()

    if (payload && typeof payload === 'object' && 'error' in payload) {
      const details =
        typeof payload.details === 'string' && payload.details.trim().length > 0
          ? ` ${payload.details}`
          : ''
      throw new Error(`${payload.error}${details}`)
    }

    throw new Error(typeof payload === 'string' ? payload : 'Unable to download study set.')
  }

  const blob = await response.blob()
  const contentDisposition = response.headers.get('content-disposition') ?? ''
  const match = contentDisposition.match(/filename="?([^"]+)"?/)
  return {
    blob,
    filename: match?.[1] ?? `study-set-${studySetId}.txt`,
  }
}

export async function fetchStudySession(studySetId, mode, options = {}) {
  const params = new URLSearchParams()
  if (mode) {
    params.set('mode', mode)
  }
  if (options.timeLimitMinutes) {
    params.set('timeLimitMinutes', String(options.timeLimitMinutes))
  }
  const query = params.toString()
  return request(`/api/study-sets/${studySetId}/study-session${query ? `?${query}` : ''}`)
}

export async function deleteStudySet(studySetId) {
  return request(`/api/study-sets/${studySetId}`, {
    method: 'DELETE',
  })
}

export async function updateStudySetVisibility(studySetId, visibility) {
  return request(`/api/study-sets/${studySetId}/visibility`, {
    method: 'PATCH',
    body: JSON.stringify({ visibility }),
  })
}

export async function createStudySet(body) {
  return request('/api/study-sets', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateStudySet(studySetId, body) {
  return request(`/api/study-sets/${studySetId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function generateDraft(body) {
  return request('/api/ai/generate-draft', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function saveGeneratedStudySet(body) {
  return request('/api/ai/save-generated-study-set', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
