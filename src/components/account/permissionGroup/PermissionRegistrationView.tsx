'use client'

import CommonButton from '@/components/common/Button'
import { InfinitePermissionScrollSelect } from '@/components/common/InfiniteScrollSelect'
import CommonSelect from '@/components/common/Select'
import { useDebouncedArrayValue } from '@/hooks/useDebouncedEffect'
import { usePermission } from '@/hooks/usePermission'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { usePermissionGroupStore } from '@/stores/permissionStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { Menu, Permission, PermissionGroupDetail, RoleUser } from '@/types/permssion'
import { getTodayDateString } from '@/utils/formatters'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
} from '@mui/material'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PermissionManagementUI({ isEditMode = false }) {
  const {
    removeUser,
    addUser,
    updateUserField,
    updateSiteProcessField,
    updateUserMemo,
    form,
    reset,
    setField,
    addSiteProcess,
    removeSiteProcess,
    toggleCheckAllItems,
    toggleUserCheck,
  } = usePermissionGroupStore()

  const {
    useUserAccountInfiniteScroll,
    useMenuListQuery,
    createPermissionMutation,
    PermissionModifyMutation,
    useSinglepermissionListQuery,
    useSinglepermissionMenuListQuery,
    useSinglepermissionUserListQuery,
    handlePermissionCancel,
  } = usePermission()

  const { showSnackbar } = useSnackbarStore()

  const params = useParams()
  const permissionDetailId = Number(params?.id)

  const { data: singlepermission } = useSinglepermissionListQuery(permissionDetailId, isEditMode)
  const { data: singleperMenumission } = useSinglepermissionMenuListQuery(
    permissionDetailId,
    isEditMode,
  )

  const { data: singleperUsermission } = useSinglepermissionUserListQuery(
    permissionDetailId,
    isEditMode,
  )

  const { data: sideMenuList } = useMenuListQuery()

  // 메뉴 및 권한 타입

  const permissionTypes = ['등록', '조회', '수정', '삭제', '승인'] as const

  const isAllChecked = form.users.length > 0 && form.userIds.length === form.users.length

  const [checkedPermissionIds, setCheckedPermissionIds] = useState<Set<number>>(new Set())

  // 메뉴의 전체 체크 추가
  const [checkedAllByType, setCheckedAllByType] = useState<Record<string, boolean>>(
    permissionTypes.reduce((acc, type) => ({ ...acc, [type]: false }), {}),
  )

  const handleCheckAllByType = (type: string, checked: boolean) => {
    // 열 전체 체크/해제
    setCheckedPermissionIds((prev) => {
      const newSet = new Set(prev)

      sideMenuList?.data.forEach((menu: Menu) => {
        const permObj = menu.permissions.find((p) => p.action === type)
        if (permObj) {
          if (checked) newSet.add(permObj.id)
          else newSet.delete(permObj.id)
        }
      })

      return newSet
    })

    // 전체 체크 상태 업데이트
    setCheckedAllByType((prev) => ({ ...prev, [type]: checked }))
  }

  useEffect(() => {
    if (
      isEditMode &&
      singlepermission?.data &&
      singleperMenumission?.data &&
      singleperUsermission?.data
    ) {
      const detail = singlepermission.data

      setField('name', detail.name)
      setField('memo', detail.memo)
      setField('userCount', detail.userCount)
      setField('hasGlobalSiteProcessAccess', detail.hasGlobalSiteProcessAccess)
      setField(
        'Date',
        `${getTodayDateString(detail.createdAt)} / ${getTodayDateString(detail.updatedAt)}`,
      )

      //[{ siteId: 0, processId: 0 }]
      const siteProcesses =
        Array.isArray(detail.sites) && detail.sites.length > 0
          ? detail.sites.map((site: PermissionGroupDetail, index: number) => ({
              siteId: site.id,
              processId: detail.processes?.[index]?.id ?? null,
            }))
          : [] // 빈 배열일 경우 기본값 1행
      setField('siteProcesses', siteProcesses)

      const permissionIds = singleperMenumission?.data?.flatMap((menu: Menu) =>
        menu.permissions.map((p: Permission) => p.id),
      )
      setCheckedPermissionIds(new Set(permissionIds))

      const users = singleperUsermission?.data?.content?.map((u: RoleUser) => ({
        userId: u.id,
        loginId: u.loginId,
        username: u.username,
        department: u.department,
        memo: u.memo ?? '',
        createdAt: u.createdAt,
      }))

      setField('users', users)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      siteProcesses.forEach(async (sp: any, idx: number) => {
        if (sp.siteId) {
          const res = await SitesProcessNameScroll({
            pageParam: 0,
            siteId: sp.siteId,
            keyword: '',
          })

          const processes = res.data?.content || []
          setProcessOptionsMap((prev) => ({
            ...prev,
            [idx]: processes,
          }))
        }
      })
    } else {
      reset()
    }
  }, [
    isEditMode,
    singlepermission?.data,
    reset,
    setField,
    singleperMenumission?.data,
    singleperUsermission?.data,
  ])

  const {
    setSitesSearch,
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    setProcessSearch,
    // processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = usePermission()

  const [processOptionsMap, setProcessOptionsMap] = useState<Record<number, []>>({})

  // 페이지 들어올 시 현장/공정이 1개 무조건 추가
  // useEffect(() => {
  //   if (isEditMode === false && form.siteProcesses.length === 0) {
  //     addSiteProcess()
  //   }
  // }, [isEditMode, addSiteProcess, form.siteProcesses.length])

  // 유저 선택 시 처리

  const handleSelectUser = (selectedUser: RoleUser, targetUserId: number) => {
    updateUserField(targetUserId, 'loginId', selectedUser.loginId)
    updateUserField(targetUserId, 'username', selectedUser.username)
    updateUserField(targetUserId, 'department', selectedUser.department ?? '')
    updateUserField(targetUserId, 'userId', selectedUser.userId)
  }

  const [focusedUserId, setFocusedUserId] = useState<number | null>(null)

  const loginIdKeywords = form.users.map((u) => u.loginId ?? '')
  const debouncedLoginIds = useDebouncedArrayValue(loginIdKeywords, 300)

  const selectedUserIds = form.users
    .map((u) => u.userId)
    .filter((id): id is number => typeof id === 'number')

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useUserAccountInfiniteScroll(debouncedLoginIds)

  const rawList = data?.pages.flatMap((page) => page.data.content) ?? []

  const loginIds = rawList
    .map((user: RoleUser) => ({
      id: user.id,
      userId: user.id,
      loginId: user.loginId,
      username: user.username,
      department: user.department,
      memo: user.memo,
    }))
    .filter((user) => !selectedUserIds.includes(user.userId))

  const setPermissionIds = usePermissionGroupStore((state) => state.setPermissionIds)

  const handleCheckboxChange = (id: number, checked: boolean, type: string) => {
    const updated = new Set(checkedPermissionIds)
    if (checked) updated.add(id)
    else updated.delete(id)

    setCheckedPermissionIds(updated)
    setPermissionIds(Array.from(updated))

    // 해당 type 전체 체크 여부 갱신
    const allChecked = sideMenuList?.data
      .map((menu: Menu) => menu.permissions.find((p) => p.action === type))
      .every((perm: Menu) => perm && updated.has(perm.id))

    setCheckedAllByType((prev) => ({ ...prev, [type]: allChecked }))
  }

  useEffect(() => {
    if (!sideMenuList) return

    // 신규 등록일 때만 체크 해제
    if (!isEditMode && sideMenuList?.data) {
      setCheckedPermissionIds(new Set())
    }
  }, [sideMenuList, isEditMode])

  useEffect(() => {
    setPermissionIds(Array.from(checkedPermissionIds))
  }, [checkedPermissionIds, setPermissionIds])

  // 현장과 공정 전체 체크!!

  const handleGlobalSiteCheck = (checked: boolean) => {
    setField('hasGlobalSiteProcessAccess', checked)
  }

  return (
    <div>
      <div className="flex-1">
        <div className="flex justify-between items-baseline ">
          <span className="font-bold border-b-2 mb-4">그룹</span>
        </div>

        <TableContainer component={Paper} style={{ maxHeight: '360px', overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                {['그룹명', '현장/공정', '계정 수', '등록일/수정일', '비고']
                  .filter((label) =>
                    isEditMode ? true : !['계정 수', '등록일/수정일'].includes(label),
                  )
                  .map((label) => (
                    <TableCell
                      key={label}
                      align="center"
                      sx={{
                        backgroundColor: '#D1D5DB',
                        border: '1px solid  #9CA3AF',
                        color: 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      {label === '현장/공정' ? (
                        <div className="flex items-center justify-between">
                          <span>현장/공정</span>
                          <div className="flex items-center gap-4">
                            <CommonButton
                              label="추가"
                              variant="primary"
                              onClick={addSiteProcess}
                              className="whitespace-nowrap"
                              disabled={form.hasGlobalSiteProcessAccess}
                            />
                            <label className="flex items-center text-[15px] gap-1">
                              <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={form.hasGlobalSiteProcessAccess}
                                onChange={(e) => handleGlobalSiteCheck(e.target.checked)}
                              />
                              전체 현장
                            </label>
                          </div>
                        </div>
                      ) : label === '그룹명' ? (
                        <div className="flex items-center justify-center">
                          <span>{label}</span>
                          <span className="text-red-500 ml-1">*</span>
                        </div>
                      ) : (
                        label
                      )}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* 그룹명 입력란 */}
              <TableRow>
                <TableCell align="center" sx={{ borderRight: '1px solid #D1D5DB' }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="그룹명 입력"
                    fullWidth
                  />
                </TableCell>
                {form.siteProcesses.length === 0 && (
                  <TableCell
                    align="center"
                    sx={{
                      borderRight: '1px solid #D1D5DB',
                      color: '#9CA3AF',
                    }}
                  >
                    (현장/공정 없음)
                  </TableCell>
                )}

                {form.siteProcesses.map((item, idx) => (
                  <TableCell
                    key={idx}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column', // 세로 정렬
                      // alignItems: 'center', // 가로 방향 가운데
                      // justifyContent: 'center', // 세로 방향 가운데 (높이 있을 때)
                      // textAlign: 'center',
                    }}
                  >
                    <div className="flex gap-2 ">
                      <CommonSelect
                        className=" w-full"
                        value={item.siteId || '0'}
                        onChange={async (selectedId) => {
                          updateSiteProcessField(idx, 'siteId', selectedId)

                          const res = await SitesProcessNameScroll({
                            pageParam: 0,
                            siteId: Number(selectedId),
                            keyword: '',
                          })

                          const processes = res.data?.content || []
                          setProcessOptionsMap((prev) => ({
                            ...prev,
                            [idx]: processes,
                          }))

                          if (processes.length > 0) {
                            updateSiteProcessField(idx, 'processId', processes[0].id)
                          } else {
                            updateSiteProcessField(idx, 'processId', 0)
                          }
                        }}
                        options={sitesOptions}
                        displayLabel
                        onScrollToBottom={() => {
                          if (siteNamehasNextPage && !siteNameFetching) siteNameFetchNextPage()
                        }}
                        onInputChange={(value) => setSitesSearch(value)}
                        loading={siteNameLoading}
                        disabled={form.hasGlobalSiteProcessAccess}
                      />

                      <CommonSelect
                        className=" w-full"
                        value={item.processId || '0'}
                        onChange={(selectedProcessId) =>
                          updateSiteProcessField(idx, 'processId', selectedProcessId)
                        }
                        // options={processOptions}
                        displayLabel
                        options={processOptionsMap[idx] || []}
                        onScrollToBottom={() => {
                          if (processInfoHasNextPage && !processInfoIsFetching)
                            processInfoFetchNextPage()
                        }}
                        onInputChange={(value) => setProcessSearch(value)}
                        loading={processInfoLoading}
                        disabled
                      />
                      <CommonButton
                        label="삭제"
                        variant="danger"
                        onClick={() => removeSiteProcess(idx)}
                        className="whitespace-nowrap"
                        disabled={form.hasGlobalSiteProcessAccess}
                      />
                    </div>
                  </TableCell>
                ))}
                {/* 계정 수 */}
                {isEditMode && (
                  <TableCell
                    align="center"
                    sx={{ borderLeft: '1px solid #D1D5DB', width: '110px' }}
                  >
                    <TextField
                      variant="outlined"
                      size="small"
                      value={form.userCount ?? ''}
                      placeholder="텍스트 입력"
                      inputProps={{
                        style: { textAlign: 'center', color: 'black' },
                      }}
                    />
                  </TableCell>
                )}

                {/* 등록일/수정일 */}
                {isEditMode && (
                  <TableCell align="center" sx={{ borderLeft: '1px solid #D1D5DB' }}>
                    <TextField
                      variant="outlined"
                      size="small"
                      value={form.Date ?? ''}
                      placeholder="텍스트 입력"
                      fullWidth
                    />
                  </TableCell>
                )}

                <TableCell align="center" sx={{ borderLeft: '1px solid #D1D5DB' }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={form.memo}
                    onChange={(e) => setField('memo', e.target.value)}
                    placeholder="500자 이하 텍스트 입력"
                    fullWidth
                  />
                </TableCell>
              </TableRow>

              {/* siteProcesses 배열만큼 행 생성 */}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="flex justify-between gap-10 mt-14">
        <div className="flex-1 w-2xs">
          <div className="flex justify-between items-baseline">
            <span className="font-bold border-b-2 mb-4">계정</span>
            <div className="flex gap-4">
              <CommonButton
                label="삭제"
                className="px-7"
                variant="danger"
                onClick={() => {
                  form.userIds.forEach((id) => removeUser(id))
                }}
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => {
                  addUser()
                }}
              />
            </div>
          </div>
          <TableContainer component={Paper} sx={{ height: '350px' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                    <Checkbox
                      checked={isAllChecked}
                      indeterminate={form.userIds.length > 0 && !isAllChecked}
                      onChange={(e) => toggleCheckAllItems(e.target.checked)}
                      sx={{ color: 'black' }}
                    />
                  </TableCell>
                  {['No.', '계정', '이름', '부서', '등록일', '비고']
                    .filter((label) => (isEditMode ? true : !['등록일'].includes(label)))
                    .map((label) => (
                      <TableCell
                        key={label}
                        align="center"
                        sx={{
                          backgroundColor: '#D1D5DB',
                          border: '1px solid  #9CA3AF',
                          color: 'black',
                          fontWeight: 'bold',
                        }}
                      >
                        {label}
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {form.users.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid  #9CA3AF' }}
                    >
                      <Checkbox
                        checked={form.userIds.includes(user.userId)}
                        onChange={(e) => toggleUserCheck(user.userId, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {index + 1}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <InfinitePermissionScrollSelect<RoleUser>
                        placeholder="이름을 입력하세요"
                        keyword={user.loginId ?? ''}
                        onChangeKeyword={(newKeyword) => {
                          updateUserField(user.userId, 'loginId', newKeyword)

                          if (newKeyword === '') {
                            // 계정을 지우면 username, department 초기화
                            updateUserField(user.userId, 'username', '')
                            updateUserField(user.userId, 'department', '')
                            updateUserField(user.userId, 'userId', 0) // 선택된 userId도 초기화
                          }
                        }}
                        items={
                          !user.loginId || user.loginId === ''
                            ? loginIds // 키워드 없으면 전체
                            : loginIds.filter((u) => u.loginId.includes(user.loginId))
                        }
                        hasNextPage={hasNextPage ?? false}
                        fetchNextPage={fetchNextPage}
                        renderItem={(item, isHighlighted) => (
                          <div className={isHighlighted ? 'font-bold text-white p-1 ' : 'p-1'}>
                            <div className="text-xs">{item.loginId}</div>
                          </div>
                        )}
                        shouldShowList={focusedUserId === user.userId && loginIds.length > 0}
                        onSelect={(selectedUser) => handleSelectUser(selectedUser, user.userId)}
                        isLoading={isLoading || isFetching}
                        debouncedKeyword={debouncedLoginIds}
                        onFocus={() => setFocusedUserId(user.userId)} // 포커스 진입 시 해당 userId 설정
                        onBlur={() => setFocusedUserId(null)}
                      />
                    </TableCell>

                    <TableCell
                      sx={{ border: '1px solid  #9CA3AF', whiteSpace: 'nowrap' }}
                      align="center"
                    >
                      {user.username ?? '-'}
                    </TableCell>

                    <TableCell
                      sx={{ border: '1px solid  #9CA3AF', whiteSpace: 'nowrap' }}
                      align="center"
                    >
                      {user.department ?? '-'}
                    </TableCell>

                    {isEditMode && (
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField
                          variant="outlined"
                          size="small"
                          value={getTodayDateString(user.createdAt) ?? '-'}
                          placeholder="텍스트 입력"
                          inputProps={{
                            style: { textAlign: 'center', color: 'black' },
                          }}
                        />
                      </TableCell>
                    )}

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        value={user.memo}
                        onChange={(e) => updateUserMemo(user.userId, e.target.value)}
                        variant="outlined"
                        placeholder="500자 이하 텍스트 입력"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black',
                            },
                            '&:hover fieldset': {
                              borderColor: 'black',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black',
                            },
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* 메뉴 권한 */}
        <div style={{ height: '400px' }}>
          <span className="font-bold border-b-2 mb-4 inline-block">메뉴권한</span>
          <TableContainer component={Paper} style={{ height: '360px' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: '#D1D5DB',
                      border: '1px solid  #9CA3AF',
                      color: 'black',
                      fontWeight: 'bold',
                      minWidth: '140px', // 추가
                      whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지 (선택)
                    }}
                  >
                    메뉴명
                  </TableCell>
                  {permissionTypes.map((type) => (
                    <TableCell
                      sx={{
                        backgroundColor: '#D1D5DB',
                        border: '1px solid  #9CA3AF',
                        color: 'black',
                        fontWeight: 'bold',
                      }}
                      key={type}
                      align="center"
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                          size="small"
                          checked={checkedAllByType[type]}
                          onChange={(e) => handleCheckAllByType(type, e.target.checked)}
                        />
                        {type}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sideMenuList?.data.map((menu: Menu) => (
                  <TableRow key={menu.id}>
                    <TableCell
                      sx={{
                        backgroundColor: '#D1D5DB',
                        fontWeight: 'bold',
                        border: '1px solid  #9CA3AF',
                      }}
                    >
                      {menu.name}
                    </TableCell>
                    {permissionTypes.map((type) => {
                      // 메뉴 내 권한 중에서 해당 action과 일치하는 permission 객체 찾기
                      const permObj = menu.permissions.find((p) => p.action === type)
                      const isChecked = permObj ? checkedPermissionIds.has(permObj.id) : false
                      return (
                        <TableCell key={type} sx={{ border: '1px solid  #9CA3AF' }} align="center">
                          <Checkbox
                            checked={isChecked}
                            onChange={(e) =>
                              // permObj && handleCheckboxChange(permObj.id, e.target.checked)
                              permObj && handleCheckboxChange(permObj.id, e.target.checked, type)
                            }
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <div className="flex justify-center gap-10 mt-10">
        <CommonButton
          label="취소"
          variant="reset"
          className="px-10"
          onClick={handlePermissionCancel}
        />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={() => {
            if (!form.name) {
              showSnackbar('그룹명을 입력해주세요.', 'warning') // 또는 snackbar로 보여줘도 됨
              return
            }
            if (isEditMode) {
              if (window.confirm('수정하시겠습니까?')) {
                PermissionModifyMutation.mutate(permissionDetailId)
              }
            } else {
              createPermissionMutation.mutate()
            }
          }}
        />
      </div>
    </div>
  )
}
