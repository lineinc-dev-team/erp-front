'use client'

import CommonButton from '@/components/common/Button'
import InfiniteScrollSelect from '@/components/common/InfiniteScrollSelect'
import CommonSelect from '@/components/common/Select'
import { useDebouncedArrayValue } from '@/hooks/useDebouncedEffect'
import { usePermission } from '@/hooks/usePermission'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { usePermissionGroupStore } from '@/stores/permissionStore'
import { Menu, Permission, PermissionGroupDetail, RoleUser } from '@/types/permssion'
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

  const [checkedPermissionIds, setCheckedPermissionIds] = useState<Set<number>>(new Set())

  // const users = usePermissionGroupStore((state) => state.form.users) // 배열 통째로 가져오기

  const {
    useUserAccountInfiniteScroll,
    useMenuListQuery,
    createPermissionMutation,
    PermissionModifyMutation,
    useSinglepermissionListQuery,
    useSinglepermissionMenuListQuery,
    useSinglepermissionUserListQuery,
    setSelectedIndex,
  } = usePermission()

  // const UserInfo = form.users
  // const checkedIds = form.userIds
  // const isAllChecked = UserInfo.length > 0 && checkedIds.length === UserInfo.length

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

  useEffect(() => {
    if (!isEditMode) {
      reset()
      return
    }

    if (singlepermission?.data && singleperMenumission?.data && singleperUsermission?.data) {
      const detail = singlepermission.data

      setField('name', detail.name)
      setField('memo', detail.memo)

      const siteProcesses = detail.sites.map((site: PermissionGroupDetail, index: number) => ({
        siteId: site.id,
        processId: detail.processes?.[index]?.id ?? null,
      }))
      setField('siteProcesses', siteProcesses)

      const permissionIds = singleperMenumission.data.flatMap((menu: Menu) =>
        menu.permissions.map((p: Permission) => p.id),
      )
      setCheckedPermissionIds(new Set(permissionIds))

      const users = singleperUsermission?.data?.content?.map((u: RoleUser) => ({
        userId: u.id,
        loginId: u.loginId,
        username: u.username,
        department: u.department,
        memo: u.memo ?? '',
      }))

      setField('users', users)
      setField(
        'userIds',
        users.map((u: RoleUser) => u.userId),
      )
    }
  }, [
    isEditMode,
    singlepermission?.data,
    reset,
    setField,
    singleperMenumission?.data,
    singleperUsermission?.data,
  ])

  const permissionTypes: Permission['action'][] = ['조회', '등록', '수정', '삭제', '승인']

  const {
    setSitesSearch,
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = usePermission()

  useEffect(() => {
    if (isEditMode === false && form.siteProcesses.length === 0) {
      addSiteProcess()
    }
  }, [isEditMode, addSiteProcess, form.siteProcesses.length])

  // 유저 선택 시 처리

  const handleSelectUser = (selectedUser: RoleUser, targetUserId: number) => {
    updateUserField(targetUserId, 'loginId', selectedUser.loginId)
    updateUserField(targetUserId, 'username', selectedUser.username)
    updateUserField(targetUserId, 'department', selectedUser.department ?? '')
    updateUserField(targetUserId, 'userId', selectedUser.userId)
  }

  // const debouncedUsername = useDebouncedValue(users.map((u) => u.loginId).join(','), 300)

  const loginIdKeywords = form.users.map((u) => u.loginId ?? '')
  const debouncedLoginIds = useDebouncedArrayValue(loginIdKeywords, 300)

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } = useUserAccountInfiniteScroll()

  // 1. 이미 선택된 userId 목록 추출
  const selectedUserIds = form.users
    .map((u) => u.userId)
    .filter((id): id is number => typeof id === 'number')

  const rawList = data?.pages[0].data.content ?? []

  const loginIds = rawList
    .map((user: RoleUser) => ({
      userId: user.id,
      loginId: user.loginId,
      username: user.username,
      department: user.department,
    }))
    .filter((user: RoleUser) => !selectedUserIds.includes(user.userId))

  const setPermissionIds = usePermissionGroupStore((state) => state.setPermissionIds)

  const handleCheckboxChange = (id: number, checked: boolean) => {
    const updated = new Set(checkedPermissionIds)

    if (checked) {
      updated.add(id)
    } else {
      updated.delete(id)
    }

    setCheckedPermissionIds(updated) //로컬 상태
    setPermissionIds(Array.from(updated)) // zustand store까지 직접 동기화
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
                {['그룹명', '현장/공정', '비고'].map((label) => (
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
                {/* 현장/공정 칸, 비고 칸은 비워두거나 필요하면 채우세요 */}

                {form.siteProcesses.map((item, idx) => (
                  <TableCell
                    key={idx}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column', // 세로 정렬
                      alignItems: 'center', // 가로 방향 가운데
                      justifyContent: 'center', // 세로 방향 가운데 (높이 있을 때)
                      textAlign: 'center',
                    }}
                  >
                    <div className="flex gap-2 ">
                      <CommonSelect
                        className=" w-full"
                        value={item.siteId || '0'}
                        onChange={async (selectedId) => {
                          updateSiteProcessField(idx, 'siteId', selectedId)

                          setSelectedIndex(selectedId)

                          // 2) 실제 siteId 값 가져오기
                          const siteId = selectedId

                          // 공정명 자동 선택 로직 추가
                          const res = await SitesProcessNameScroll({
                            pageParam: 0,
                            siteId: siteId,
                            keyword: '',
                          })

                          const processes = res.data?.content || []
                          if (processes.length > 0) {
                            const firstProcessId = processes[0].id
                            updateSiteProcessField(idx, 'processId', firstProcessId)
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
                      />

                      <CommonSelect
                        className=" w-full"
                        value={item.processId || '0'}
                        onChange={(selectedIndex) =>
                          updateSiteProcessField(idx, 'processId', selectedIndex)
                        }
                        options={processOptions}
                        displayLabel
                        onScrollToBottom={() => {
                          if (processInfoHasNextPage && !processInfoIsFetching)
                            processInfoFetchNextPage()
                        }}
                        onInputChange={(value) => setProcessSearch(value)}
                        loading={processInfoLoading}
                      />
                      {idx === 0 ? (
                        <CommonButton
                          label="추가"
                          variant="primary"
                          onClick={addSiteProcess}
                          className="whitespace-nowrap"
                        />
                      ) : (
                        <CommonButton
                          label="삭제"
                          variant="danger"
                          onClick={() => removeSiteProcess(idx)}
                          className="whitespace-nowrap"
                        />
                      )}
                    </div>
                  </TableCell>
                ))}

                <TableCell align="center" sx={{ borderLeft: '1px solid #D1D5DB' }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={form.memo}
                    onChange={(e) => setField('memo', e.target.value)}
                    placeholder="텍스트 입력"
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
        <div className="flex-1 ">
          <div className="flex justify-between items-baseline w-[870px]">
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
                      checked={form.users.length > 0 && form.userIds.length === form.users.length}
                      indeterminate={
                        form.userIds.length > 0 && form.userIds.length < form.users.length
                      }
                      onChange={(e) => toggleCheckAllItems(e.target.checked)}
                      sx={{ color: 'black' }}
                    />
                  </TableCell>
                  {['No.', '계정', '이름', '부서', '비고/메모'].map((label) => (
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
                      <InfiniteScrollSelect<RoleUser>
                        placeholder="이름을 입력하세요"
                        keyword={user.loginId ?? ''}
                        onChangeKeyword={(newKeyword) =>
                          updateUserField(user.userId, 'loginId', newKeyword)
                        }
                        items={loginIds}
                        hasNextPage={hasNextPage ?? false}
                        fetchNextPage={fetchNextPage}
                        renderItem={(item, isHighlighted) => (
                          <div className={isHighlighted ? 'font-bold text-white p-1 ' : 'p-1'}>
                            <div className="text-xs">{item.loginId}</div>
                          </div>
                        )}
                        // onSelect={handleSelectUser}
                        onSelect={(selectedUser) => handleSelectUser(selectedUser, user.userId)}
                        shouldShowList={true}
                        isLoading={isLoading || isFetching}
                        debouncedKeyword={debouncedLoginIds[index]}
                      />
                    </TableCell>

                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      {user.username ?? '-'}
                    </TableCell>

                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      {user.department ?? '-'}
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        value={user.memo}
                        onChange={(e) => updateUserMemo(user.userId, e.target.value)}
                        variant="outlined"
                        placeholder="메모 입력"
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
        <div style={{ width: '480px', height: '400px' }}>
          <span className="font-bold border-b-2 mb-4 inline-block">메뉴권한</span>
          <TableContainer component={Paper} style={{ height: '360px', overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: '#D1D5DB',
                      border: '1px solid  #9CA3AF',
                      color: 'black',
                      fontWeight: 'bold',
                      maxWidth: '400px',
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
                      {type}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sideMenuList?.data.map((menu: Menu) => (
                  <TableRow key={menu.id}>
                    <TableCell sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
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
                              permObj && handleCheckboxChange(permObj.id, e.target.checked)
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
          //  onClick={handleAccountCancel}
        />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={() => {
            if (isEditMode) {
              PermissionModifyMutation.mutate(permissionDetailId)
            } else {
              createPermissionMutation.mutate()
            }
          }}
        />
      </div>
    </div>
  )
}
