/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import CommonInput from '../../common/Input'
import CommonSelect from '../../common/Select'
import CommonButton from '../../common/Button'
import {
  Box,
  Checkbox,
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { AreaCode, EquipmentType } from '@/config/erp.confing'
import { formatPersonNumber, formatPhoneNumber } from '@/utils/formatPhoneNumber'
import CommonFileInput from '@/components/common/FileInput'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  HistoryItem,
  // OutsourcingAttachedFile,
  // OutsourcingManager,
} from '@/types/outsourcingCompany'
import { formatDateTime, formatNumber, unformatNumber } from '@/utils/formatters'
import { useContractFormStore } from '@/stores/outsourcingContractStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import AmountInput from '@/components/common/AmountInput'
import {
  ContractDetailService,
  ContractEquipmentDetailService,
  ContractPersonDetailService,
  GetCompanyNameInfoService,
  OutsourcingConstructionDetailService,
  OutsourcingDriverDetailService,
} from '@/services/outsourcingContract/outsourcingContractRegistrationService'
import {
  CompanyInfo,
  OutsourcingArticleInfoAttachedFile,
  OutsourcingContractAttachedFile,
  OutsourcingContractFormState,
  OutsourcingContractItem,
  OutsourcingContractManager,
  OutsourcingContractPersonAttachedFile,
  OutsourcingEquipmentInfoAttachedFile,
} from '@/types/outsourcingContract'
import CommonDatePicker from '@/components/common/DatePicker'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useQuery } from '@tanstack/react-query'
import CommonMultiFileInput from '@/components/common/CommonMultiFileInput'

export default function OutsourcingContractRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    setForm,
    updateMemo,
    setRepresentativeManager,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,
    getTotalContractQty,
    getTotalContractAmount,
    getTotalOutsourceQty,
    getTotalOutsourceAmount,
    removeSubEquipment,
    addSubEquipment,
    updateSubEquipmentField,
  } = useContractFormStore()

  const {
    setSitesSearch,
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    // 공정명
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,

    // 업체명

    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,

    // 옵션 타입
    createOutSourcingContractMutation,
    typeMethodOptions,
    taxMethodOptions,
    outsourcingCancel,
    deduMethodOptions,
    ContractModifyBtn,
    useOutsourcingContractHistoryDataQuery,
    statusMethodOptions,
    categoryMethodOptions,
  } = useOutSourcingContract()

  const managers = form.headManagers
  const checkedIds = form.checkedManagerIds
  const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds

  const filesToCheck = attachedFiles.filter((f) => f.type !== 'GUARANTEE' && f.type !== 'CONTRACT')
  const isFilesAllChecked = filesToCheck.length > 0 && fileCheckIds.length === filesToCheck.length
  // 인력
  const personAddAttachedFiles = form.personManagers
  const personCheckIds = form.checkedPersonIds
  const isPersonAllChecked =
    personAddAttachedFiles.length > 0 && personCheckIds.length === personAddAttachedFiles.length

  // 장비

  const equipmentAddAttachedFiles = form.equipmentManagers
  const equipmentCheckIds = form.checkedEquipmentIds
  const isEquipmentAllChecked =
    equipmentAddAttachedFiles.length > 0 &&
    equipmentCheckIds.length === equipmentAddAttachedFiles.length

  // 장비 중 기사

  const articleAddAttachedFiles = form.articleManagers
  const articleCheckIds = form.checkedArticleIds
  const isArticleAllChecked =
    articleAddAttachedFiles.length > 0 && articleCheckIds.length === articleAddAttachedFiles.length

  // 공사
  const contractAddAttachedFiles = form.contractManagers
  const contractCheckIds = form.checkedContractIds
  const isContractAllChecked =
    contractAddAttachedFiles.length > 0 &&
    contractCheckIds.length === contractAddAttachedFiles.length

  useEffect(() => {
    const files = []

    if (form.type === 'CONSTRUCTION') {
      files.push(
        {
          id: Date.now() + 1,
          name: '보증서',
          memo: '',
          files: [],
          type: 'GUARANTEE',
        },
        { id: Date.now(), name: '계약서', memo: '', files: [], type: 'CONTRACT' },
      )
    } else {
      files.push({ id: Date.now(), name: '계약서', memo: '', files: [], type: 'CONTRACT' })
    }

    setForm({ attachedFiles: files })
  }, [form.type])

  const params = useParams()
  const outsourcingContractId = Number(params?.id)

  const selectedValues = (form.defaultDeductions?.split(',') || []).filter(Boolean)

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const current = (form.defaultDeductions?.split(',') || []).filter(Boolean)
    const updated = checked
      ? [...new Set([...current, value])]
      : current.filter((item) => item !== value)

    setField('defaultDeductions', updated.join(','))
  }

  // 상세 데이터 넣기

  const { data: contractDetailData } = useQuery({
    queryKey: ['OutsourcingDetailInfo'],
    queryFn: () => ContractDetailService(outsourcingContractId),
    enabled: isEditMode && !!outsourcingContractId, // 수정 모드일 때만 fetch
  })

  // 인력
  const { data: outsourcingPersonList } = useQuery({
    queryKey: ['OutsourcingPersonDetailInfo'],
    queryFn: () => ContractPersonDetailService(outsourcingContractId),
    enabled: isEditMode && !!outsourcingContractId && contractDetailData?.data?.type === '용역', // 타입이 장비일 때만
  })

  // 공사데이터
  const { data: contractConstructionDetailData } = useQuery({
    queryKey: ['OutsourcingConstructionDetailInfo'],
    queryFn: () => OutsourcingConstructionDetailService(outsourcingContractId),
    enabled: isEditMode && !!outsourcingContractId && contractDetailData?.data?.type === '공사', // 타입이 장비일 때만
  })

  // 장비 데이터
  const { data: contractEquipmentDetailData } = useQuery({
    queryKey: ['OutsourcingEqDetailInfo'],
    queryFn: () => ContractEquipmentDetailService(outsourcingContractId),
    enabled: isEditMode && !!outsourcingContractId && contractDetailData?.data?.type === '장비', // 타입이 장비일 때만
  })

  // 기사 데이터

  const { data: contractDriverDetailData } = useQuery({
    queryKey: ['OutsourcingDrDetailInfo'],
    queryFn: () => OutsourcingDriverDetailService(outsourcingContractId),
    enabled: isEditMode && !!outsourcingContractId && contractDetailData?.data?.type === '장비', // 타입이 장비일 때만
  })

  const PROPERTY_NAME_MAP: Record<string, string> = {
    contractStartDateFormat: '계약기간(시작)',
    contractEndDateFormat: '계약기간(종료)',
    taxInvoiceConditionName: '세금계산서 발행조건',
    statusName: '상태',
    taxInvoiceIssueDayOfMonth: '세금 발행조건 기간',
    siteName: '현장명',
    CompanyName: '업체명',
    categoryName: '유형',
    contractAmount: '계약금액(총액)',
    memo: '비고',
    businessNumber: '사업자등록번호',
    typeName: '구분명',
    typeDescription: '구분 설명',
    defaultDeductionsName: '기본공제 항목',
    defaultDeductionsDescription: '기본공제 항목 설명',
    originalFileName: '파일 추가',
    outsourcingCompanyName: '업체명',
    unitPrice: '단가',
    subtotal: '소계',
    taskDescription: '작업내용',
    category: '구분',
    position: '직급(직책)',
    landlineNumber: '전화번호',
    name: '이름',
    department: '부서',
    email: '이메일',
    phoneNumber: '개인 휴대폰',
  }

  const { showSnackbar } = useSnackbarStore()

  const {
    data: outsourcingContractHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useOutsourcingContractHistoryDataQuery(outsourcingContractId, isEditMode)

  const historyList = useContractFormStore((state) => state.form.changeHistories)

  // 현장명이 지워졌을떄 보이는 로직

  const [updatedSiteOptions, setUpdatedSiteOptions] = useState(sitesOptions)
  const [updatedProcessOptions, setUpdatedProcessOptions] = useState(processOptions)

  useEffect(() => {
    if (contractDetailData && isEditMode) {
      const client = contractDetailData.data

      // 기존 siteOptions 복사
      const newSiteOptions = [...sitesOptions]

      if (client.site) {
        const siteName = client.site.name + (client.site.deleted ? ' (삭제됨)' : '')

        // 이미 options에 있는지 체크
        const exists = newSiteOptions.some((s) => s.id === client.site.id)
        if (!exists) {
          newSiteOptions.push({
            id: client.site.id,
            name: siteName,
            deleted: client.site.deleted,
          })
        }
      }

      // 삭제된 현장 / 일반 현장 분리
      const deletedSites = newSiteOptions.filter((s) => s.deleted)
      const normalSites = newSiteOptions.filter((s) => !s.deleted && s.id !== 0)

      // 최종 옵션 배열 세팅
      setUpdatedSiteOptions([
        newSiteOptions.find((s) => s.id === 0) ?? { id: 0, name: '선택', deleted: false },
        ...deletedSites,
        ...normalSites,
      ])

      // 선택된 현장 id 세팅
      setField('siteId', client.site?.id ?? 0)
    } else if (!isEditMode) {
      // 등록 모드
      setUpdatedSiteOptions(sitesOptions)
      setField('siteId', 0)
    }
  }, [contractDetailData, isEditMode, sitesOptions])

  useEffect(() => {
    if (isEditMode && contractDetailData) {
      const client = contractDetailData.data

      // 이전 상태 기반으로 새 배열 생성

      const newProcessOptions = [...updatedProcessOptions, ...processOptions]
        .filter((p, index, self) => index === self.findIndex((el) => el.id === p.id)) // id 중복 제거
        .filter((p) => p.id === 0 || p.deleted || (!p.deleted && p.id !== 0)) // 조건 필터링

      if (client.siteProcess) {
        const isDeleted = client.siteProcess.deleted || client.site?.deleted
        const processName = client.siteProcess.name + (isDeleted ? ' (삭제됨)' : '')

        if (!newProcessOptions.some((p) => p.id === client.siteProcess.id)) {
          newProcessOptions.push({
            id: client.siteProcess.id,
            name: processName,
            deleted: isDeleted,
          })
        }

        setField('processId', client.siteProcess.id)
        setField('processName', processName)
      }

      // 삭제된 공정 / 일반 공정 분리
      const deletedProcesses = newProcessOptions.filter((p) => p.deleted)
      const normalProcesses = newProcessOptions.filter((p) => !p.deleted && p.id !== 0)

      setUpdatedProcessOptions([
        newProcessOptions.find((s) => s.id === 0) ?? { id: 0, name: '선택', deleted: false },
        ...deletedProcesses,
        ...normalProcesses,
      ])
    } else if (!isEditMode) {
      // 등록 모드
      setUpdatedProcessOptions(processOptions)
    }
  }, [contractDetailData, isEditMode, processOptions, setField])

  const [updatedCompanyOptions, setUpdatedCompanyOptions] = useState(companyOptions)

  useEffect(() => {
    if (contractDetailData && isEditMode) {
      const client = contractDetailData.data

      const newCompanyOptions = [...companyOptions]

      if (client.outsourcingCompany) {
        const companyName =
          client.outsourcingCompany.name + (client.outsourcingCompany.deleted ? ' (삭제됨)' : '')

        // 이미 options에 있는지 체크
        const exists = newCompanyOptions.some((c) => c.id === client.outsourcingCompany.id)
        if (!exists) {
          newCompanyOptions.push({
            id: client.outsourcingCompany.id,
            name: companyName,
            businessNumber: client.outsourcingCompany.businessNumber ?? '',
            ceoName: client.outsourcingCompany.ceoName ?? '',
            bankName: client.outsourcingCompany.bankName ?? '',
            accountNumber: client.outsourcingCompany.accountNumber ?? '',
            accountHolder: client.outsourcingCompany.accountHolder ?? '',
            deleted: client.outsourcingCompany.deleted,
          })
        }
      }

      const deletedCompanies = newCompanyOptions.filter((c) => c.deleted)
      const normalCompanies = newCompanyOptions.filter((c) => !c.deleted && c.id !== 0)

      setUpdatedCompanyOptions([
        newCompanyOptions.find((c) => c.id === 0) ?? {
          id: 0,
          name: '선택',
          businessNumber: '',
          ceoName: '',
          bankName: '',
          accountNumber: '',
          accountHolder: '',
          deleted: false,
        },
        ...deletedCompanies,
        ...normalCompanies,
      ])

      setField('CompanyId', client.outsourcingCompany?.id ?? 0)
    } else if (!isEditMode) {
      setUpdatedCompanyOptions(companyOptions)
      setField('CompanyId', 0) // "선택" 기본값
    }
  }, [contractDetailData, isEditMode, companyOptions])

  useEffect(() => {
    if (contractDetailData && isEditMode === true) {
      const client = contractDetailData.data

      console.log('cleint@@', client)

      function parseLandlineNumber(landline: string) {
        if (!landline) return { managerAreaNumber: '', landlineNumber: '' }

        const parts = landline.split('-')

        if (parts.length === 3) {
          return {
            managerAreaNumber: parts[0], // "02"
            landlineNumber: `${parts[1]}-${parts[2]}`, // "123-5678"
          }
        } else if (parts.length === 2) {
          // "02-1234567" → ["02", "1234567"]
          return {
            managerAreaNumber: parts[0], // "02"
            landlineNumber: parts[1], // "1234567"
          }
        } else {
          // 하이픈 없거나 이상한 경우
          return {
            managerAreaNumber: '',
            landlineNumber: landline.replace(/-/g, ''),
          }
        }
      }

      // 담당자 데이터 가공
      const formattedContacts = (client.contacts ?? []).map((c: OutsourcingContractManager) => {
        const { managerAreaNumber, landlineNumber } = parseLandlineNumber(c.landlineNumber ?? '')

        return {
          id: c.id,
          name: c.name,
          position: c.position,
          department: c.department,
          phoneNumber: c.phoneNumber,
          email: c.email,
          memo: c.memo,
          isMain: c.isMain,
          // 분리된 값 추가
          managerAreaNumber,
          landlineNumber,
        }
      })

      const formattedFiles = (client.files ?? [])
        .map((item: OutsourcingContractAttachedFile) => ({
          id: item.id,
          name: item.name,
          memo: item.memo,
          type: item.typeCode,
          files: [
            {
              fileUrl: item.fileUrl || '', // null 대신 안전하게 빈 문자열
              originalFileName: item.originalFileName || '',
            },
          ],
        }))
        .sort((a: OutsourcingContractAttachedFile, b: OutsourcingContractAttachedFile) => {
          const priority = ['CONTRACT', 'GUARANTEE'] // 우선순위 정의
          const aPriority = priority.includes(a.type) ? 0 : 1
          const bPriority = priority.includes(b.type) ? 0 : 1
          return aPriority - bPriority
        })

      // 각 필드에 set
      setField('siteId', client.site?.id)
      setField('processId', client.siteProcess?.id)
      setField('CompanyId', client.outsourcingCompany?.id)
      setField('businessNumber', client.outsourcingCompany?.businessNumber)
      setField('type', client?.typeCode)
      setField('typeDescription', client?.typeDescription)

      // 계약 기간
      setField('contractStartDate', new Date(client.contractStartDate) || null)
      setField('contractEndDate', new Date(client.contractEndDate) || null)
      // 계약 금액
      setField('contractAmount', client.contractAmount || 0)

      if (client.defaultDeductions) {
        const deductionNames = client.defaultDeductions.split(',').map((s: string) => s.trim())

        const matchedCodes = deduMethodOptions
          .filter((opt) => deductionNames.includes(opt.name))
          .map((opt) => opt.code)

        setField('defaultDeductions', matchedCodes.join(','))
      }
      setField('defaultDeductionsDescription', client.defaultDeductionsDescription)
      // 세금 계산서 조건
      setField('taxCalculat', client.taxInvoiceConditionCode || '')
      setField('taxInvoiceIssueDayOfMonth', client.taxInvoiceIssueDayOfMonth || 0)

      // 유형(설비 등일 때)
      setField('category', client.categoryCode || '')

      // 상태
      setField('status', client.statusCode || '')

      // 비고
      setField('memo', client.memo || '')
      setField('headManagers', formattedContacts)
      setField('attachedFiles', formattedFiles)

      if (client.type === '용역') {
        const getContractItems =
          outsourcingPersonList?.data?.content?.map(
            (item: OutsourcingContractPersonAttachedFile) => ({
              id: item.id,
              name: item.name,
              memo: item.memo,
              category: item.category,
              taskDescription: item.taskDescription,
              files: (item.files ?? []).map((file) => ({
                id: file.id,
                fileUrl: file.fileUrl,
                originalFileName: file.originalFileName,
              })),
            }),
          ) ?? []

        setField('personManagers', getContractItems)
      } else if (client.type === '공사') {
        const contractData = contractConstructionDetailData?.data

        if (contractData) {
          const getContractItems = (contractData.content ?? []).map(
            (item: OutsourcingContractItem) => ({
              id: item.id,
              item: item.item,
              specification: item.specification,
              unit: item.unit,
              unitPrice: item.unitPrice,
              contractQuantity: item.contractQuantity,
              contractPrice: item.contractPrice,
              outsourcingContractQuantity: item.outsourcingContractQuantity,
              outsourcingContractPrice: item.outsourcingContractPrice,
              memo: item.memo,
            }),
          )

          setField('contractManagers', getContractItems)
        }
      } else if (client.type === '장비') {
        const Equipment = contractEquipmentDetailData?.data

        if (Equipment) {
          const getEquipmentItems = (Equipment.content ?? []).map(
            (item: OutsourcingEquipmentInfoAttachedFile) => ({
              id: item.id,
              specification: item.specification,
              vehicleNumber: item.vehicleNumber,
              category: item.category,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              taskDescription: item.taskDescription,
              memo: item.memo,
              subEquipments: (item.subEquipments ?? []).map((sub) => ({
                id: sub.id,
                typeCode: sub.typeCode,
                memo: sub.memo,
              })),
            }),
          )
          setField('equipmentManagers', getEquipmentItems)
        }

        const DriverData = contractDriverDetailData?.data

        if (DriverData) {
          const getArticleItems = (DriverData.content ?? []).map(
            (item: OutsourcingArticleInfoAttachedFile) => {
              // files 분류
              const driverLicenseFiles = (item?.files ?? []).filter(
                (f) => f.documentTypeCode === 'DRIVER_LICENSE',
              )
              const safetyEducationFiles = (item?.files ?? []).filter(
                (f) => f.documentTypeCode === 'SAFETY_EDUCATION',
              )
              const etcFiles = (item?.files ?? []).filter(
                (f) =>
                  f.documentTypeCode !== 'DRIVER_LICENSE' &&
                  f.documentTypeCode !== 'SAFETY_EDUCATION',
              )

              return {
                id: item.id,
                name: item.name,
                memo: item.memo,
                // 각 문서 타입 배열 그대로 넣기
                driverLicense: driverLicenseFiles.map((f) => ({
                  id: f.id,
                  fileUrl: f.fileUrl && f.fileUrl.trim() !== '' ? f.fileUrl : null,
                  originalFileName:
                    f.originalFileName && f.originalFileName.trim() !== ''
                      ? f.originalFileName
                      : null,
                })),
                safeEducation: safetyEducationFiles.map((f) => ({
                  id: f.id,
                  fileUrl: f.fileUrl && f.fileUrl.trim() !== '' ? f.fileUrl : null,
                  originalFileName:
                    f.originalFileName && f.originalFileName.trim() !== ''
                      ? f.originalFileName
                      : null,
                })),
                ETCfiles: etcFiles.map((f) => ({
                  id: f.id,
                  fileUrl: f.fileUrl && f.fileUrl.trim() !== '' ? f.fileUrl : null,
                  originalFileName:
                    f.originalFileName && f.originalFileName.trim() !== ''
                      ? f.originalFileName
                      : null,
                })),
              }
            },
          )

          console.log(
            ' 받아온 값 확인 getArticleItemsgetArticleItemsgetArticleItems',
            getArticleItems,
          )
          setField('articleManagers', getArticleItems)
        }
      } else if (client.type === '기타') {
      }
    } else {
      reset()
    }
  }, [
    contractDetailData,
    outsourcingPersonList,
    contractConstructionDetailData,
    contractEquipmentDetailData,
    contractDriverDetailData,
    isEditMode,
    reset,
    setField,
    companyOptions,
  ])

  const formatChangeDetail = (getChanges: string) => {
    try {
      const parsed = JSON.parse(getChanges)
      if (!Array.isArray(parsed)) return '-'

      return parsed.map(
        (item: { property: string; before: string | null; after: string | null }, idx: number) => {
          const propertyKo = PROPERTY_NAME_MAP[item.property] || item.property

          const convertValue = (value: string | null) => {
            if (value === 'true') return '사용'
            if (value === 'false') return '미사용'
            if (value === null || value === 'null') return 'null'
            return value
          }

          let before = convertValue(item.before)
          let after = convertValue(item.after)

          // 스타일 결정
          let style = {}
          if (before === 'null') {
            before = '추가'
            style = { color: '#1976d2' } // 파란색 - 추가
          } else if (after === 'null' || after === '') {
            after = '삭제'
            style = { color: '#d32f2f' } // 빨간색 - 삭제
          }

          return (
            <Typography key={idx} component="div" style={style}>
              {before === '추가'
                ? `추가됨 => ${after}`
                : after === '삭제'
                ? ` ${before} => 삭제됨`
                : `${propertyKo} : ${before} => ${after}`}
            </Typography>
          )
        },
      )
    } catch (e) {
      if (e instanceof Error) return '-'
    }
  }

  // 수정이력 데이터가 들어옴
  useEffect(() => {
    if (outsourcingContractHistoryList?.pages) {
      console.log(
        'outsourcingContractHistoryListoutsourcingContractHistoryList',
        outsourcingContractHistoryList,
      )
      const allHistories = outsourcingContractHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          type: item.type,
          content: formatChangeDetail(item.getChanges), // 여기 변경
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          updatedBy: item.updatedBy,
          memo: item.memo ?? '',
        })),
      )
      setField('changeHistories', allHistories)
    }
  }, [outsourcingContractHistoryList, setField])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading],
  )

  // 인력 쪽 무한 스크롤 콜백함수구현
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // const loadMorePersonRef = useCallback(
  //   (node: HTMLDivElement | null) => {
  //     if (!node || outsourcingPersonIsLoading || outsourcingPersonIsFetchingNextPage) return

  //     const observer = new IntersectionObserver(
  //       (entries) => {
  //         if (entries[0].isIntersecting && outsourcingPersonHasNextPage) {
  //           outsourcingPersonFetchNextPage()
  //         }
  //       },
  //       { root: scrollContainerRef.current, threshold: 0.5 },
  //     )

  //     observer.observe(node)
  //     return () => observer.unobserve(node)
  //   },
  //   [
  //     outsourcingPersonFetchNextPage,
  //     outsourcingPersonIsFetchingNextPage,
  //     outsourcingPersonIsLoading,
  //     outsourcingPersonHasNextPage,
  //   ],
  // )

  const [isChecked, setIsChecked] = useState(false)

  const handleTaxCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked)

    // 체크 해제 시 taxDay 값 초기화 (선택 사항)
    if (!e.target.checked) {
      setField('taxInvoiceIssueDayOfMonth', 0)
    }
  }

  function validateClientForm(form: OutsourcingContractFormState) {
    if (!form.siteId) return '현장명을 입력하세요.'
    if (!form.processId) return '공정명을 선택해주세요.'
    if (!form.CompanyId) return '업체명을 입력하세요.'
    if (!form.type?.trim()) return '구분을 입력하세요.'
    if (form.type === 'ETC' && !form.typeDescription?.trim())
      return '구분 상세 내용을 입력해주세요.'
    if (!form.contractStartDate) return '계약 시작일을 입력해주세요.'
    if (!form.contractEndDate) return '계약 종료일을 입력해주세요.'
    if (
      form.contractStartDate &&
      form.contractEndDate &&
      new Date(form.contractEndDate) < new Date(form.contractStartDate)
    )
      return '계약 종료일은 시작일 이후여야 합니다.'
    if (!form.contractAmount) return '계약금액을 입력해주세요.'

    if (!(form.defaultDeductions?.split(',').filter(Boolean)?.length > 0)) {
      return '기본공제 항목을 선택해주세요.'
    }

    if (!form.taxCalculat?.trim()) return '세금계산서 발행조건을 입력하세요.'

    if (isChecked && (!form.taxInvoiceIssueDayOfMonth || form.taxInvoiceIssueDayOfMonth <= 0)) {
      return '세금계산서 발행일을 입력해주세요.'
    }

    if (form.type === 'EQUIPMENT' && !form.category?.trim()) {
      return '유형을 선택해주세요.'
    }

    if (!form.status) return '상태를 입력해주세요.'

    if (form.memo.length > 500) {
      return '비고는 500자 이하로 입력해주세요.'
    }

    if (managers.length > 0) {
      for (const item of managers) {
        if (!item.name?.trim()) return '담당자의 이름을 입력해주세요.'
        if (!item.position?.trim()) return '담당자의 부서를 입력해주세요.'
        if (!item.department?.trim()) return '담당자의 직급(직책)을 입력해주세요.'
        if (!item.landlineNumber?.trim()) return '담당자의 전화번호를 입력해주세요.'
        if (!item.phoneNumber?.trim()) return '담당자의 개인 휴대폰을 입력해주세요.'
        if (!item.email?.trim()) return '담당자의 이메일을 입력해주세요.'
        if (item.memo.length > 500) {
          return '담당자의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    if (personAddAttachedFiles.length > 0) {
      for (const item of personAddAttachedFiles) {
        if (!item.name?.trim()) return '인력의 이름을 입력해주세요.'
        if (!item.category?.trim()) return '인력의 구분을 입력해주세요.'
        if (!item.taskDescription?.trim()) return '인력의 작업내용을 입력해주세요.'
        if (item.memo.length > 500) {
          return '인력의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    if (equipmentAddAttachedFiles.length > 0) {
      for (const item of equipmentAddAttachedFiles) {
        if (!item.specification?.trim()) return '장비의 규격을 입력해주세요.'
        if (!item.vehicleNumber?.trim()) return '장비의 차량번호를 입력해주세요.'
        if (!item.category?.trim()) return '장비의 구분을 입력해주세요.'
        if (!item.unitPrice) return '장비의 단가를 입력해주세요.'
        if (!item.subtotal) return '장비의 소계를 입력해주세요.'
        if (item.memo.length > 500) {
          return '장비의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    if (articleAddAttachedFiles.length > 0) {
      for (const item of articleAddAttachedFiles) {
        if (!item.name?.trim()) return '기사의 이름을 입력해주세요.'
        if (item.memo.length > 500) {
          return '기사의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    if (contractAddAttachedFiles.length > 0) {
      for (const item of contractAddAttachedFiles) {
        if (!item.item?.trim()) return '공사의 항목을 입력해주세요.'
        if (!item.specification?.trim()) return '공사의 규격을 입력해주세요.'
        if (!item.unit?.trim()) return '공사의 단가를 입력해주세요.'
        if (!item.unitPrice) return '공사의 도급단가를 입력해주세요.'
        if (!item.contractQuantity) return '공사의 도급금액의 수량을 입력해주세요.'
        if (!item.contractPrice) return '공사의 도급금액의 금액을 입력해주세요.'
        if (!item.outsourcingContractQuantity) return '공사의 외주계약금액의 수량을 입력해주세요.'
        if (!item.outsourcingContractPrice) return '공사의 외주계약금액의 금액을 입력해주세요.'
        if (item.memo.length > 500) {
          return '공사의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    if (attachedFiles.length > 0) {
      for (const item of attachedFiles) {
        if (!item.name?.trim()) return '첨부파일의 이름을 입력해주세요.'
        if (item.memo.length > 500) {
          return '첨부파일의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    return null
  }

  const handleOutSourcingContractSubmit = () => {
    const errorMsg = validateClientForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        ContractModifyBtn.mutate(outsourcingContractId)
      }
    } else {
      createOutSourcingContractMutation.mutate()
    }
  }

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                value={form.siteId || 0}
                onChange={async (value) => {
                  const selectedSite = updatedSiteOptions.find((opt) => opt.id === value)
                  if (!selectedSite) return

                  // 현장 선택값 세팅
                  setField('siteId', selectedSite.id)
                  setField(
                    'siteName',
                    selectedSite.name + (selectedSite.deleted ? ' (삭제됨)' : ''),
                  )

                  if (selectedSite.deleted) {
                    const deletedProcess = updatedProcessOptions.find(
                      (p) => p.id === contractDetailData?.data.siteProcess?.id,
                    )
                    if (deletedProcess) {
                      setField('processId', deletedProcess.id)
                      setField(
                        'processName',
                        deletedProcess.name + (deletedProcess.deleted ? ' (삭제됨)' : ''),
                      )
                    } else {
                      setField('processId', 0)
                      setField('processName', '')
                    }
                    return
                  } else if (selectedSite.deleted === false) {
                    // 일반 현장은 API로 공정 목록 가져오기
                    const res = await SitesProcessNameScroll({
                      pageParam: 0,
                      siteId: selectedSite.id,
                      keyword: '',
                    })
                    const processes = res.data?.content || []

                    console.log('현재 processesprocesses!', processes)

                    if (processes.length > 0) {
                      setField('processId', processes[0].id)
                      setField('processName', processes[0].name)
                    } else {
                      setField('processId', 0)
                      setField('processName', '')
                    }
                  }
                }}
                options={updatedSiteOptions}
                onScrollToBottom={() => {
                  if (siteNamehasNextPage && !siteNameFetching) siteNameFetchNextPage()
                }}
                onInputChange={(value) => setSitesSearch(value)}
                loading={siteNameLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              공정명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.processId || 0}
                onChange={(value) => {
                  const selectedProcess = updatedProcessOptions.find((opt) => opt.name === value)
                  if (selectedProcess) {
                    setField('processId', selectedProcess.id)
                    setField('processName', selectedProcess.name)
                  }
                }}
                options={updatedProcessOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (processInfoHasNextPage && !processInfoIsFetching) processInfoFetchNextPage()
                }}
                onInputChange={(value) => setProcessSearch(value)}
                loading={processInfoLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              업체명
            </label>
            <div className="border border-gray-400 p-2 px-2 w-full">
              <CommonSelect
                fullWidth
                value={form.CompanyId || 0}
                onChange={async (value) => {
                  const selectedCompany = updatedCompanyOptions.find((opt) => opt.id === value)
                  if (!selectedCompany) return

                  setField('CompanyId', selectedCompany.id)
                  setField('CompanyName', selectedCompany.name)

                  // 🔹 삭제된 업체를 선택한 경우 - 기존 정보 바로 사용
                  if (selectedCompany.deleted) {
                    setField('businessNumber', selectedCompany.businessNumber || '')

                    return
                  }

                  const res = await GetCompanyNameInfoService({
                    pageParam: 0,
                    keyword: '',
                  })

                  const companyList = res.data?.content || []

                  const matched = companyList.find(
                    (company: CompanyInfo) => company.id === selectedCompany.id,
                  )

                  if (matched) {
                    setField('businessNumber', matched.businessNumber)
                  } else {
                    setField('businessNumber', '')
                  }
                }}
                options={updatedCompanyOptions}
                onScrollToBottom={() => {
                  if (comPanyNamehasNextPage && !comPanyNameFetching) comPanyNameFetchNextPage()
                }}
                // onInputChange={(value) => setCompanySearch(value)}
                loading={comPanyNameLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              사업자등록번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.businessNumber ?? ''}
                onChange={(value) => {
                  setField('businessNumber', value)
                }}
                disabled={true}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              구분
            </label>
            <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
              <div className="flex gap-2 items-center">
                <CommonSelect
                  className="text-2xl"
                  value={form.type || 'BASE'}
                  onChange={(value) => setField('type', value)}
                  options={typeMethodOptions}
                  disabled={isEditMode}
                />

                <CommonInput
                  value={form.typeDescription}
                  onChange={(value) => setField('typeDescription', value)}
                  className="flex-1"
                  disabled={isEditMode || form.type !== 'ETC'}
                  placeholder={form.type === 'ETC' ? '기타 내용을 입력하세요' : ''}
                />
              </div>
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계약기간(시작/종료)
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={form.contractStartDate}
                onChange={(value) => {
                  setField('contractStartDate', value)

                  if (
                    value !== null &&
                    form.contractEndDate !== null &&
                    new Date(form.contractEndDate) < new Date(value)
                  ) {
                    setField('contractEndDate', value)
                  }
                }}
              />
              ~
              <CommonDatePicker
                value={form.contractEndDate}
                onChange={(value) => {
                  if (
                    value !== null &&
                    form.contractStartDate !== null &&
                    new Date(value) < new Date(form.contractStartDate)
                  ) {
                    showSnackbar('종료일은 시작일 이후여야 합니다.', 'error')
                    return
                  }
                  setField('contractEndDate', value)
                }}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              계약금액(총액)
            </label>
            <div className="border border-gray-400 p-2 px-2 w-full">
              <AmountInput
                value={formatNumber(form.contractAmount)}
                onChange={(val) => {
                  const numericValue = unformatNumber(val)
                  setField('contractAmount', numericValue)
                }}
                placeholder="금액을 입력하세요"
                className="w-full p-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-[119px] 2xl:w-[124px] text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              공제 항목 기본값
            </label>
            <div className="flex border  border-gray-400 flex-wrap px-2 items-center gap-4 flex-1">
              {deduMethodOptions.map((opt) => (
                <label key={opt.code} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(opt.code)}
                    onChange={(e) => handleCheckboxChange(opt.code, e.target.checked)}
                  />
                  {opt.name}
                </label>
              ))}

              <CommonInput
                placeholder="텍스트 입력, ','구분"
                value={form.defaultDeductionsDescription}
                onChange={(value) => setField('defaultDeductionsDescription', value)}
                className="flex-1 text-sm"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
              세금계산서 발행조건
            </label>

            <div className="border flex items-center gap-2 p-2 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.taxCalculat || 'BASE'}
                onChange={(value) => setField('taxCalculat', value)}
                options={taxMethodOptions}
              />

              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={isChecked} onChange={handleTaxCheckboxChange} />
                매월
              </label>

              <label className="flex items-center gap-1 text-sm">
                <AmountInput
                  disabled={!isChecked}
                  value={form.taxInvoiceIssueDayOfMonth}
                  onChange={(value) => setField('taxInvoiceIssueDayOfMonth', Number(value))}
                  placeholder={isChecked === true ? '숫자를 입력하세요' : ''}
                  className="w-[120px] p-1 text-xs"
                />
                <span>일</span>
              </label>
            </div>
          </div>

          {form.type === 'EQUIPMENT' && (
            <div className="flex">
              <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
                유형
              </label>
              <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
                <CommonSelect
                  className="text-2xl"
                  value={form.category || 'BASE'}
                  onChange={(value) => setField('category', value)}
                  options={categoryMethodOptions}
                />
              </div>
            </div>
          )}

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              상태
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.status || 'BASE'}
                onChange={(value) => setField('status', value)}
                options={statusMethodOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.memo}
                onChange={(value) => setField('memo', value)}
                className=" flex-1"
                placeholder="500자 이하 텍스트 입력"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 담당자 */}
      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">담당자</span>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeCheckedItems('manager')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => addItem('manager')}
            />
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                  <Checkbox
                    checked={isAllChecked}
                    indeterminate={checkedIds.length > 0 && !isAllChecked}
                    onChange={(e) => toggleCheckAllItems('manager', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>
                {[
                  '대표담당자',
                  '이름',
                  '부서',
                  '직급(직책)',
                  '전화번호',
                  '개인 휴대폰',
                  '이메일',
                  '비고',
                ].map((label) => (
                  <TableCell
                    key={label}
                    align="center"
                    sx={{
                      backgroundColor: '#D1D5DB',
                      border: '1px solid  #9CA3AF',
                      color: 'black',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {managers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell
                    padding="checkbox"
                    align="center"
                    sx={{ border: '1px solid  #9CA3AF' }}
                  >
                    <Checkbox
                      checked={checkedIds.includes(m.id)}
                      onChange={(e) => toggleCheckItem('manager', m.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <Radio
                      checked={m.isMain === true}
                      onChange={() => setRepresentativeManager(m.id)}
                      value={m.id}
                      name="representative"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      placeholder="텍스트 입력"
                      size="small"
                      value={m.name}
                      onChange={(e) => updateItemField('manager', m.id, 'name', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      placeholder="텍스트 입력"
                      size="small"
                      value={m.position}
                      onChange={(e) => updateItemField('manager', m.id, 'position', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      placeholder="텍스트 입력"
                      size="small"
                      value={m.department}
                      onChange={(e) =>
                        updateItemField('manager', m.id, 'department', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      border: '1px solid #9CA3AF',
                      padding: '8px',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CommonSelect
                        value={m.managerAreaNumber}
                        onChange={(value) => {
                          updateItemField('manager', m.id, 'managerAreaNumber', value)
                        }}
                        options={AreaCode}
                      />

                      <TextField
                        size="small"
                        placeholder="'-'없이 숫자만 입력"
                        value={m.landlineNumber}
                        onChange={(e) => {
                          const formatAreaNumber = formatPersonNumber(e.target.value)
                          updateItemField('manager', m.id, 'landlineNumber', formatAreaNumber)
                        }}
                        sx={{ width: 120 }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="'-'없이 숫자만 입력"
                      value={m.phoneNumber}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value)
                        updateItemField('manager', m.id, 'phoneNumber', formatted)
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.email}
                      onChange={(e) => updateItemField('manager', m.id, 'email', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="500자 이하 텍스트 입력"
                      value={m.memo}
                      onChange={(e) => updateItemField('manager', m.id, 'memo', e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* 첨부파일 */}
      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">첨부파일</span>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeCheckedItems('attachedFile')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => addItem('attachedFile')}
            />
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                  <Checkbox
                    checked={isFilesAllChecked}
                    indeterminate={fileCheckIds.length > 0 && !isFilesAllChecked}
                    onChange={(e) => toggleCheckAllItems('attachedFile', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>
                {['문서명', '첨부', '비고'].map((label) => (
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
              {attachedFiles.map((m) => (
                <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                  <TableCell
                    padding="checkbox"
                    align="center"
                    sx={{ border: '1px solid  #9CA3AF' }}
                  >
                    <Checkbox
                      checked={fileCheckIds.includes(m.id)}
                      disabled={m.type === 'CONTRACT' || m.type === 'GUARANTEE'}
                      onChange={(e) => toggleCheckItem('attachedFile', m.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      sx={{ width: '100%' }}
                      value={m.name}
                      onChange={(e) =>
                        updateItemField('attachedFile', m.id, 'name', e.target.value)
                      }
                      disabled={m.type === 'CONTRACT' || m.type === 'GUARANTEE'}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                      <CommonFileInput
                        acceptedExtensions={[
                          'pdf',
                          'jpg',
                          'png',
                          'hwp',
                          'xlsx',
                          'zip',
                          'jpeg',
                          'ppt',
                        ]}
                        multiple={false}
                        files={m.files} // 각 항목별 files
                        onChange={(newFiles) => {
                          updateItemField('attachedFile', m.id, 'files', newFiles.slice(0, 1))
                          // updateItemField('attachedFile', m.id, 'files', newFiles)
                        }}
                        uploadTarget="OUTSOURCING_COMPANY_CONTRACT"
                      />
                    </div>
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="500자 이하 텍스트 입력"
                      sx={{ width: '100%' }}
                      value={m.memo}
                      onChange={(e) =>
                        updateItemField('attachedFile', m.id, 'memo', e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* 구분에서 인력 클릭 시  */}
      {form.type === 'SERVICE' && (
        <div ref={scrollContainerRef} className="h-[340px] overflow-y-auto mt-10">
          <div className="flex justify-between items-center  mb-2">
            <span className="font-bold border-b-2 mb-4">인력</span>
            <div className="flex gap-4">
              <CommonButton
                label="삭제"
                className="px-7"
                variant="danger"
                onClick={() => removeCheckedItems('personAttachedFile')}
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('personAttachedFile')}
              />
            </div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                    <Checkbox
                      checked={isPersonAllChecked}
                      indeterminate={personCheckIds.length > 0 && !isPersonAllChecked}
                      onChange={(e) => toggleCheckAllItems('personAttachedFile', e.target.checked)}
                      sx={{ color: 'black' }}
                    />
                  </TableCell>
                  {['이름', '구분', '작업내용', , '관련서류', '비고'].map((label) => (
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
                {personAddAttachedFiles.map((m) => (
                  <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid  #9CA3AF' }}
                    >
                      <Checkbox
                        checked={personCheckIds.includes(m.id)}
                        onChange={(e) =>
                          toggleCheckItem('personAttachedFile', m.id, e.target.checked)
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        sx={{ width: '100%' }}
                        value={m.name}
                        onChange={(e) =>
                          updateItemField('personAttachedFile', m.id, 'name', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        sx={{ width: '100%' }}
                        value={m.category}
                        onChange={(e) =>
                          updateItemField('personAttachedFile', m.id, 'category', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        sx={{ width: '100%' }}
                        value={m.taskDescription}
                        onChange={(e) =>
                          updateItemField(
                            'personAttachedFile',
                            m.id,
                            'taskDescription',
                            e.target.value,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                        <CommonMultiFileInput
                          className="text-left"
                          acceptedExtensions={[
                            'pdf',
                            'jpg',
                            'png',
                            'hwp',
                            'xlsx',
                            'zip',
                            'jpeg',
                            'ppt',
                          ]}
                          files={m.files} // 각 항목별 files
                          onChange={
                            (newFiles) =>
                              updateItemField('personAttachedFile', m.id, 'files', newFiles) //  해당 항목만 업데이트
                          }
                          uploadTarget="OUTSOURCING_COMPANY_CONTRACT"
                        />
                      </div>
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="500자 이하 텍스트 입력"
                        sx={{ width: '100%' }}
                        value={m.memo}
                        onChange={(e) =>
                          updateItemField('personAttachedFile', m.id, 'memo', e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {/* {outsourcingPersonHasNextPage && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <div ref={loadMorePersonRef}>불러오는 중...</div>
                    </TableCell>
                  </TableRow>
                )} */}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      {/* 구분에서 공사 클릭 시  */}

      {form.type === 'CONSTRUCTION' && (
        <>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span style={{ fontWeight: 'bold', borderBottom: '2px solid black', marginBottom: 16 }}>
              외주공사 항목
            </span>
            <div style={{ display: 'flex', gap: 16 }}>
              <CommonButton
                label="삭제"
                className="px-7"
                variant="danger"
                onClick={() => removeCheckedItems('workSize')}
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('workSize')}
              />
            </div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small" sx={{ borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                  <TableCell rowSpan={2} padding="checkbox" sx={{ border: '1px solid #9CA3AF' }}>
                    <Checkbox
                      checked={isContractAllChecked}
                      indeterminate={contractCheckIds.length > 0 && !isContractAllChecked}
                      onChange={(e) => toggleCheckAllItems('workSize', e.target.checked)}
                      sx={{ color: 'black' }}
                    />
                  </TableCell>
                  {/* <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    No.
                  </TableCell> */}
                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    항목
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    규격
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    단위
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    도급단가
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    도급금액
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    외주계약금액
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    비고
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    수량
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    금액
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    수량
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    금액
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {contractAddAttachedFiles.map((m) => (
                  <TableRow key={m.id} sx={{ border: '1px solid #9CA3AF' }}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid #9CA3AF' }}
                    >
                      <Checkbox
                        checked={contractCheckIds.includes(m.id)}
                        onChange={(e) => toggleCheckItem('workSize', m.id, e.target.checked)}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력(50자)"
                        value={m.item || ''}
                        onChange={(e) => updateItemField('workSize', m.id, 'item', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력(50자)"
                        value={m.specification || ''}
                        onChange={(e) =>
                          updateItemField('workSize', m.id, 'specification', e.target.value)
                        }
                        inputProps={{ maxLength: 50 }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="10자"
                        value={m.unit || ''}
                        onChange={(e) => updateItemField('workSize', m.id, 'unit', e.target.value)}
                        inputProps={{ maxLength: 10 }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="숫자만"
                        value={formatNumber(m.unitPrice)}
                        onChange={(e) => {
                          const numericValue = unformatNumber(e.target.value)
                          updateItemField('workSize', m.id, 'unitPrice', numericValue)
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          style: { textAlign: 'right' }, // ← 오른쪽 정렬
                        }}
                        fullWidth
                      />
                    </TableCell>

                    {/* 도급금액 수량 */}
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="숫자만"
                        value={formatNumber(m.contractQuantity)}
                        onChange={(e) => {
                          const numericValue = unformatNumber(e.target.value)
                          updateItemField('workSize', m.id, 'contractQuantity', numericValue)
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          style: { textAlign: 'right' }, // ← 오른쪽 정렬
                        }}
                        fullWidth
                      />
                    </TableCell>

                    {/* 도급금액 금액 */}
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="숫자만"
                        value={formatNumber(m.contractPrice)}
                        onChange={(e) => {
                          const numericValue = unformatNumber(e.target.value)
                          updateItemField('workSize', m.id, 'contractPrice', numericValue)
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          style: { textAlign: 'right' }, // ← 오른쪽 정렬
                        }}
                        fullWidth
                      />
                    </TableCell>

                    {/* 외주계약금액 수량 */}
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="숫자만"
                        value={formatNumber(m.outsourcingContractQuantity)}
                        onChange={(e) => {
                          const numericValue = unformatNumber(e.target.value)
                          updateItemField(
                            'workSize',
                            m.id,
                            'outsourcingContractQuantity',
                            numericValue,
                          )
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          style: { textAlign: 'right' }, // ← 오른쪽 정렬
                        }}
                        fullWidth
                      />
                    </TableCell>

                    {/* 외주계약금액 금액 */}
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="숫자만"
                        value={formatNumber(m.outsourcingContractPrice)}
                        onChange={(e) => {
                          const numericValue = unformatNumber(e.target.value)
                          updateItemField(
                            'workSize',
                            m.id,
                            'outsourcingContractPrice',
                            numericValue,
                          )
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          style: { textAlign: 'right' }, // ← 오른쪽 정렬
                        }}
                        fullWidth
                      />
                    </TableCell>

                    {/* 비고 */}
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="500자 이하 텍스트 입력"
                        multiline
                        rows={2}
                        value={m.memo || ''}
                        onChange={(e) => updateItemField('workSize', m.id, 'memo', e.target.value)}
                        inputProps={{ maxLength: 500 }}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                  <TableCell
                    colSpan={5}
                    align="right"
                    sx={{
                      border: '1px solid #9CA3AF',
                      fontSize: '16px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    소계
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getTotalContractQty().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getTotalContractAmount().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getTotalOutsourceQty().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getTotalOutsourceAmount().toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #9CA3AF' }} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* 구분에서 장비 클릭 시  */}

      {/* 장비 */}

      {form.type === 'EQUIPMENT' && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold border-b-2 mb-4">장비</span>
            <div className="flex gap-4">
              <CommonButton
                label="삭제"
                className="px-7"
                variant="danger"
                onClick={() => removeCheckedItems('equipment')}
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('equipment')}
              />
            </div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                    <Checkbox
                      checked={isEquipmentAllChecked}
                      indeterminate={equipmentCheckIds.length > 0 && !isEquipmentAllChecked}
                      onChange={(e) => toggleCheckAllItems('equipment', e.target.checked)}
                      sx={{ color: 'black' }}
                    />
                  </TableCell>
                  {['규격', '차량번호', '구분', '단가', '소계', '작업내용', '비고'].map((label) => (
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
                {equipmentAddAttachedFiles.map((m) => (
                  <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid  #9CA3AF' }}
                    >
                      <Checkbox
                        checked={equipmentCheckIds.includes(m.id)}
                        onChange={(e) => toggleCheckItem('equipment', m.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <TextField
                        size="small"
                        placeholder="규격 입력"
                        sx={{ width: '100%' }}
                        value={m.specification}
                        onChange={(e) =>
                          updateItemField('equipment', m.id, 'specification', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <TextField
                        size="small"
                        placeholder="차량번호 입력"
                        sx={{ width: '100%' }}
                        value={m.vehicleNumber}
                        onChange={(e) =>
                          updateItemField('equipment', m.id, 'vehicleNumber', e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <div className="flex gap-3">
                        <TextField
                          size="small"
                          placeholder="텍스트 입력"
                          sx={{ flex: 1 }} // flex:1으로 너비 균등
                          value={m.category}
                          onChange={(e) =>
                            updateItemField('equipment', m.id, 'category', e.target.value)
                          }
                        />
                        <CommonButton
                          label="추가"
                          variant="primary"
                          onClick={() => addSubEquipment(m.id)}
                          className="whitespace-nowrap"
                        />
                      </div>

                      {m.subEquipments &&
                        m.subEquipments.map((item, idx) => (
                          <div
                            key={item.id ?? idx}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              marginTop: 8,
                            }}
                          >
                            <div className="flex gap-6 ">
                              <CommonSelect
                                className="text-2xl w-[110px]"
                                value={item.typeCode || 'BASE'}
                                onChange={(value) =>
                                  updateSubEquipmentField(m.id, item.id, 'typeCode', value)
                                }
                                options={EquipmentType}
                              />
                              <TextField
                                size="small"
                                value={item.memo ?? ''}
                                onChange={(e) =>
                                  updateSubEquipmentField(m.id, item.id, 'memo', e.target.value)
                                }
                              />

                              <CommonButton
                                label="삭제"
                                variant="danger"
                                onClick={() => removeSubEquipment(m.id, item.id)}
                                className="whitespace-nowrap"
                              />
                            </div>
                          </div>
                        ))}
                    </TableCell>

                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <TextField
                        size="small"
                        placeholder="숫자만"
                        value={formatNumber(m.unitPrice)}
                        onChange={(e) => {
                          const numericValue = unformatNumber(e.target.value)
                          updateItemField('equipment', m.id, 'unitPrice', numericValue)
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          style: { textAlign: 'right' }, // ← 오른쪽 정렬
                        }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <TextField
                        size="small"
                        placeholder="숫자만"
                        value={formatNumber(m.subtotal)}
                        onChange={(e) => {
                          const numericValue = unformatNumber(e.target.value)
                          updateItemField('equipment', m.id, 'subtotal', numericValue)
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          style: { textAlign: 'right' }, // ← 오른쪽 정렬
                        }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <TextField
                        size="small"
                        placeholder="작업내용 입력"
                        sx={{ width: '100%' }}
                        value={m.taskDescription}
                        onChange={(e) =>
                          updateItemField('equipment', m.id, 'taskDescription', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <TextField
                        size="small"
                        placeholder="500자 이하 텍스트 입력"
                        sx={{ width: '100%' }}
                        value={m.memo}
                        onChange={(e) => updateItemField('equipment', m.id, 'memo', e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* 기사 */}
      {form.type === 'EQUIPMENT' && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold border-b-2 mb-4">기사</span>
            <div className="flex gap-4">
              <CommonButton
                label="삭제"
                className="px-7"
                variant="danger"
                onClick={() => removeCheckedItems('articleInfo')}
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('articleInfo')}
              />
            </div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                    <Checkbox
                      checked={isArticleAllChecked}
                      indeterminate={articleCheckIds.length > 0 && !isArticleAllChecked}
                      onChange={(e) => toggleCheckAllItems('articleInfo', e.target.checked)}
                      sx={{ color: 'black' }}
                    />
                  </TableCell>
                  {['이름', '기사저격증', '안전교육', '기타서류', '비고'].map((label) => (
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
                {articleAddAttachedFiles.map((m) => (
                  <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid  #9CA3AF' }}
                    >
                      <Checkbox
                        checked={articleCheckIds.includes(m.id)}
                        onChange={(e) => toggleCheckItem('articleInfo', m.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        sx={{ width: '100%' }}
                        value={m.name}
                        onChange={(e) =>
                          updateItemField('articleInfo', m.id, 'name', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                        <CommonMultiFileInput
                          className="text-left"
                          acceptedExtensions={[
                            'pdf',
                            'jpg',
                            'png',
                            'hwp',
                            'xlsx',
                            'zip',
                            'jpeg',
                            'ppt',
                          ]}
                          files={m.driverLicense} // 각 항목별 files
                          onChange={
                            (newFiles) =>
                              updateItemField('articleInfo', m.id, 'driverLicense', newFiles) //  해당 항목만 업데이트
                          }
                          uploadTarget="OUTSOURCING_COMPANY_CONTRACT"
                        />
                      </div>
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                        <CommonMultiFileInput
                          className="text-left"
                          acceptedExtensions={[
                            'pdf',
                            'jpg',
                            'png',
                            'hwp',
                            'xlsx',
                            'zip',
                            'jpeg',
                            'ppt',
                          ]}
                          files={m.safeEducation} // 각 항목별 files
                          onChange={
                            (newFiles) =>
                              updateItemField('articleInfo', m.id, 'safeEducation', newFiles) //  해당 항목만 업데이트
                          }
                          uploadTarget="OUTSOURCING_COMPANY_CONTRACT"
                        />
                      </div>
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                        <CommonMultiFileInput
                          className="text-left"
                          acceptedExtensions={[
                            'pdf',
                            'jpg',
                            'png',
                            'hwp',
                            'xlsx',
                            'zip',
                            'jpeg',
                            'ppt',
                          ]}
                          files={m.ETCfiles} // 각 항목별 files
                          onChange={
                            (newFiles) => updateItemField('articleInfo', m.id, 'ETCfiles', newFiles) //  해당 항목만 업데이트
                          }
                          uploadTarget="OUTSOURCING_COMPANY_CONTRACT"
                        />
                      </div>
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="500자 이하 텍스트 입력"
                        sx={{ width: '100%' }}
                        value={m.memo}
                        onChange={(e) =>
                          updateItemField('articleInfo', m.id, 'memo', e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {isEditMode && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold border-b-2 mb-4">수정이력</span>
            <div className="flex gap-4"></div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  {[
                    { label: '수정일시', width: '12%' },
                    { label: '항목', width: '5%' },
                    { label: '수정항목', width: '30%' },
                    { label: '수정자', width: '2%' },
                    { label: '비고', width: '15%' },
                  ].map(({ label, width }) => (
                    <TableCell
                      key={label}
                      align="center"
                      sx={{
                        backgroundColor: '#D1D5DB',
                        border: '1px solid #9CA3AF',
                        color: 'black',
                        fontWeight: 'bold',
                        width,
                        maxWidth: width,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {historyList.map((item: HistoryItem) => (
                  <TableRow key={item.id}>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {formatDateTime(item.createdAt)} / {formatDateTime(item.updatedAt)}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        border: '1px solid  #9CA3AF',
                        textAlign: 'center',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {item.type}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ border: '1px solid  #9CA3AF', whiteSpace: 'pre-line' }}
                    >
                      {item.content}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ border: '1px solid  #9CA3AF', whiteSpace: 'pre-line' }}
                    >
                      {item.updatedBy}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={item.memo ?? ''}
                        placeholder="500자 이하 텍스트 입력"
                        onChange={(e) => updateMemo(item.id, e.target.value)}
                        multiline
                        inputProps={{ maxLength: 500 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {hasNextPage && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ border: 'none' }}>
                      <div ref={loadMoreRef} className="p-4 text-gray-500 text-sm">
                        불러오는 중...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      <div className="flex justify-center gap-10 mt-10">
        <CommonButton label="취소" variant="reset" className="px-10" onClick={outsourcingCancel} />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleOutSourcingContractSubmit}
        />
      </div>
    </>
  )
}
