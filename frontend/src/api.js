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
      throw new Error(payload.error)
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

export async function fetchMyStudySets() {
  return request('/api/my/study-sets')
}

export async function fetchStudySetDetail(studySetId) {
  return request(`/api/study-sets/${studySetId}`)
}

export async function createStudySet(body) {
  return request('/api/study-sets', {
    method: 'POST',
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
