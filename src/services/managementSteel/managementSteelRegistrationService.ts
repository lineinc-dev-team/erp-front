import { API } from '@/api/config/env'
import { useManagementSteelFormStore } from '@/stores/managementSteelStore'

// 등록
// export async function CreateManagementSteel() {
//   const { newSteelData } = useManagementSteelFormStore.getState()
//   const payload = newSteelData()

//   const res = await fetch(API.STEEL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(payload),
//     credentials: 'include',
//   })

//   if (!res.ok) {
//     if (res.status === 401) {
//       // 로그인 페이지로 이동
//       window.location.href = '/'
//       return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
//     }
//     // 서버에서 내려준 메시지 꺼내기
//     let errorMessage = `서버 에러: ${res.status}`
//     try {
//       const errorData = await res.json()
//       if (errorData?.message) {
//         errorMessage = errorData.message
//       }
//     } catch {
//       // json 파싱 실패 시는 그냥 status만 전달
//     }

//     throw new Error(errorMessage)
//   }

//   return await res.status
// }

// 등록2
export async function CreateManagementSteel() {
  const { newSteelData } = useManagementSteelFormStore.getState()
  const payload = newSteelData()

  const res = await fetch(API.STEELv2, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    // 서버에서 내려준 메시지 꺼내기
    let errorMessage = `서버 에러: ${res.status}`
    try {
      const errorData = await res.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      }
    } catch {
      // json 파싱 실패 시는 그냥 status만 전달
    }

    throw new Error(errorMessage)
  }

  return await res.status
}

// 강재 상세
// export async function SteelDetailService(steelDetailId: number) {
//   const res = await fetch(`${API.STEEL}/${steelDetailId}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     credentials: 'include',
//   })
//   if (!res.ok) {
//     if (res.status === 401) {
//       // 로그인 페이지로 이동
//       window.location.href = '/'
//       return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
//     }
//     throw new Error(`서버 에러: ${res.status}`)
//   }

//   return await res.json()
// }

export async function SteelDetailService(steelDetailId: number, type?: string) {
  // type이 있을 때만 query string 붙이기
  const url = type
    ? `${API.STEELv2}/${steelDetailId}?type=${type}`
    : `${API.STEELv2}/${steelDetailId}`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = '/'
      return
    }
    throw new Error(`서버 에러: ${res.status}`)
  }

  return await res.json()
}

// 강재 수정
// export async function ModifySteelManagement(steelId: number) {
//   const { newSteelData } = useManagementSteelFormStore.getState()
//   const originalPayload = newSteelData()

//   const res = await fetch(`${API.STEEL}/${steelId}`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(originalPayload),
//     credentials: 'include',
//   })

//   if (!res.ok) {
//     if (res.status === 401) {
//       // 로그인 페이지로 이동
//       window.location.href = '/'
//       return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
//     }
//     // 서버에서 내려준 메시지 꺼내기
//     let errorMessage = `서버 에러: ${res.status}`
//     try {
//       const errorData = await res.json()
//       if (errorData?.message) {
//         errorMessage = errorData.message
//       }
//     } catch {
//       // json 파싱 실패 시는 그냥 status만 전달
//     }

//     throw new Error(errorMessage)
//   }

//   return res.status
// }

export async function ModifySteelManagement(steelId: number) {
  const { newSteelData } = useManagementSteelFormStore.getState()
  const originalPayload = newSteelData()

  const res = await fetch(`${API.STEELv2}/${steelId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(originalPayload),
    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    // 서버에서 내려준 메시지 꺼내기
    let errorMessage = `서버 에러: ${res.status}`
    try {
      const errorData = await res.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      }
    } catch {
      // json 파싱 실패 시는 그냥 status만 전달
    }

    throw new Error(errorMessage)
  }

  return res.status
}

// 외주 업체 등록 시 필요한 공제 항목 조회
export async function SteelTypeIdInfoService() {
  const resData = await fetch(`${API.STEEL}/steel-management-types`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!resData.ok) {
    if (resData.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}

// 수정 이력 조회

// 자재 계약 수정이력 조회
// export async function SteelInfoHistoryService(
//   historyId: number,
//   page: number = 0,
//   size: number = 4,
//   sort: string,
// ) {
//   const resData = await fetch(
//     `${API.STEEL}/${historyId}/change-histories?page=${page}&size=${size}&sort=${sort}`,
//     {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//     },
//   )

//   if (!resData.ok) {
//     if (resData.status === 401) {
//       // 로그인 페이지로 이동
//       window.location.href = '/'
//       return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
//     }
//     throw new Error(`서버 에러: ${resData.status}`)
//   }

//   const data = await resData.json()
//   return data
// }

export async function SteelInfoHistoryService(
  historyId: number,
  page: number = 0,
  size: number = 4,
  sort: string,
) {
  const resData = await fetch(
    `${API.STEELv2}/${historyId}/change-histories?page=${page}&size=${size}&sort=${sort}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

  if (!resData.ok) {
    if (resData.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}

//엑셀 다운로드

export async function SteelDetailExcelDownload(id: number) {
  // if (fields && fields.length > 0) {
  //   queryParams.append('fields', fields.join(','))
  // }

  const res = await fetch(`${API.STEELv2}/${id}/download`, {
    method: 'GET',
    // headers: {
    //   Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // },

    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '강재수불부 상세 목록.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)

  return res.status
}

// 규격에 대한  키워드 검색

export async function GetSpecificationsInfoService({ keyword = '' }) {
  const resData = await fetch(`${API.STEELv2}/specifications?keyword=${keyword}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!resData.ok) {
    if (resData.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}
