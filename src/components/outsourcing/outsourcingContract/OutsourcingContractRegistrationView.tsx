/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { HistoryItem } from '@/types/ordering'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { InfiniteScrollSelect } from '@/components/common/InfiniteScrollSelect'

export default function OutsourcingContractRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    resetType,
    setForm,
    updateMemo,
    setRepresentativeManager,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,
    getTotalContractQty,
    getTotalContractAmount,
    getTotalOutsourceQty,
    getTotalOutsourcePrices,
    getTotalOutsourceAmount,
    removeSubEquipment,
    addSubEquipment,
    updateSubEquipmentField,

    addContractDetailItem,
    removeContractDetailItem,

    // 여기 추가
    updateContractDetailField,
  } = useContractFormStore()

  const {
    useSitePersonNameListInfiniteScroll,

    // 공정명
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,

    // 업체명

    useOutsourcingNameListInfiniteScroll,

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
  // const personAddAttachedFiles = form.personManagers
  // const personCheckIds = form.checkedPersonIds
  // const isPersonAllChecked =
  //   personAddAttachedFiles.length > 0 && personCheckIds.length === personAddAttachedFiles.length

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
    queryKey: ['OutsourcingContractInfo'],
    queryFn: () => ContractDetailService(outsourcingContractId),
    enabled: isEditMode && !!outsourcingContractId, // 수정 모드일 때만 fetch
  })

  const { data: outsourcingPersonList } = useQuery({
    queryKey: ['OutsourcingPersonDetailInfo'],
    queryFn: () => ContractPersonDetailService(outsourcingContractId),
    enabled: isEditMode && !!outsourcingContractId && contractDetailData?.data?.type === '노무', // 타입이 장비일 때만
  })

  // 외주 데이터
  const { data: contractConstructionDetailData } = useQuery({
    queryKey: ['OutsourcingConstructionDetailInfo'],
    queryFn: () => OutsourcingConstructionDetailService(outsourcingContractId),
    enabled: isEditMode && !!outsourcingContractId && contractDetailData?.data?.type === '외주', // 타입이 장비일 때만
  })

  // 장비 데이터
  const { data: contractEquipmentDetailData } = useQuery({
    queryKey: ['OutsourcingEqDetailInfo'],
    queryFn: () => ContractEquipmentDetailService(outsourcingContractId),
    enabled:
      (isEditMode && !!outsourcingContractId && contractDetailData?.data?.type === '장비') ||
      contractDetailData?.data?.type === '외주', // 타입이 장비일 때만
  })

  // 장비 데이터

  const { data: contractDriverDetailData } = useQuery({
    queryKey: ['OutsourcingDrDetailInfo'],
    queryFn: () => OutsourcingDriverDetailService(outsourcingContractId),
    enabled:
      (isEditMode && !!outsourcingContractId && contractDetailData?.data?.type === '장비') ||
      contractDetailData?.data?.type === '외주', // 타입이 장비일 때만
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
    description: '상세내용',
    businessNumber: '사업자등록번호',
    typeName: '유형',
    typeDescription: '구분 설명',
    defaultDeductionsName: '기본공제 항목',
    defaultDeductionsDescription: '기본공제 항목 설명',
    originalFileName: '파일 추가',
    outsourcingCompanyName: '업체명',
    unitPrice: '단가',
    // subtotal: '소계',
    taskDescription: '작업내용',
    category: '구분',
    position: '직급(직책)',
    landlineNumber: '전화번호',
    name: '이름',
    itemName: '항목명',
    workTypeName: '공종명',
    department: '부서',
    email: '이메일',
    phoneNumber: '개인 휴대폰',
    specification: '규격',
    vehicleNumber: '차량번호',
    contractQuantity: '도급 수량',
    outsourcingContractPrice: '외주계약금액',
    outsourcingContractUnitPrice: '외주계약금액의 단가',
    item: '단위',
    unit: '단가',
    outsourcingContractQuantity: '외주계약금액의 수량',
    contractPrice: '계약금액의 금액',
    processName: '업체명',
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

  // const [updatedSiteOptions, setUpdatedSiteOptions] = useState(sitesOptions)

  // useEffect(() => {
  //   if (contractDetailData && isEditMode) {
  //     const client = contractDetailData.data

  //     // 기존 siteOptions 복사
  //     const newSiteOptions = [...sitesOptions]

  //     if (client.site) {
  //       const siteName = client.site.name + (client.site.deleted ? ' (삭제됨)' : '')

  //       // 이미 options에 있는지 체크
  //       const exists = newSiteOptions.some((s) => s.id === client.site.id)
  //       if (!exists) {
  //         newSiteOptions.push({
  //           id: client.site.id,
  //           name: siteName,
  //           deleted: client.site.deleted,
  //         })
  //       }
  //     }

  //     // 삭제된 현장 / 일반 현장 분리
  //     const deletedSites = newSiteOptions.filter((s) => s.deleted)
  //     const normalSites = newSiteOptions.filter((s) => !s.deleted && s.id !== 0)

  //     // 최종 옵션 배열 세팅
  //     setUpdatedSiteOptions([
  //       newSiteOptions.find((s) => s.id === 0) ?? { id: 0, name: '선택', deleted: false },
  //       ...deletedSites,
  //       ...normalSites,
  //     ])

  //     // 선택된 현장 id 세팅
  //     setField('siteId', client.site?.id ?? 0)
  //   } else if (!isEditMode) {
  //     // 등록 모드
  //     setUpdatedSiteOptions(sitesOptions)
  //     setField('siteId', 0)
  //   }
  // }, [contractDetailData, isEditMode, sitesOptions])

  const [updatedProcessOptions, setUpdatedProcessOptions] = useState(processOptions)

  useEffect(() => {
    if (isEditMode && contractDetailData) {
      const client = contractDetailData.data

      // 이전 상태 기반으로 새 배열 생성

      const newProcessOptions = [...processOptions, ...updatedProcessOptions]
        .filter((p, index, self) => index === self.findIndex((el) => el.id === p.id)) // id 중복 제거
        .filter((p) => p.id === 0 || p.deleted || (!p.deleted && p.id !== 0)) // 조건 필터링

      if (client.siteProcess) {
        const isDeleted = client.siteProcess.deleted || client.site?.deleted
        const processName = client.siteProcess.name + (isDeleted ? ' (삭제됨)' : '')

        if (!form.processId) {
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

  // const [updatedCompanyOptions, setUpdatedCompanyOptions] = useState(companyOptions)

  // useEffect(() => {
  //   if (contractDetailData && isEditMode) {
  //     const client = contractDetailData.data

  //     const newCompanyOptions = [...companyOptions]

  //     if (client.outsourcingCompany) {
  //       const companyName =
  //         client.outsourcingCompany.name + (client.outsourcingCompany.deleted ? ' (삭제됨)' : '')

  //       // 이미 options에 있는지 체크
  //       const exists = newCompanyOptions.some((c) => c.id === client.outsourcingCompany.id)
  //       if (!exists) {
  //         newCompanyOptions.push({
  //           id: client.outsourcingCompany.id,
  //           name: companyName,
  //           businessNumber: client.outsourcingCompany.businessNumber ?? '',
  //           ceoName: client.outsourcingCompany.ceoName ?? '',
  //           bankName: client.outsourcingCompany.bankName ?? '',
  //           accountNumber: client.outsourcingCompany.accountNumber ?? '',
  //           accountHolder: client.outsourcingCompany.accountHolder ?? '',
  //           deleted: client.outsourcingCompany.deleted,
  //         })
  //       }
  //     }

  //     const deletedCompanies = newCompanyOptions.filter((c) => c.deleted)
  //     const normalCompanies = newCompanyOptions.filter((c) => !c.deleted && c.id !== 0)

  //     setUpdatedCompanyOptions([
  //       newCompanyOptions.find((c) => c.id === 0) ?? {
  //         id: 0,
  //         name: '선택',
  //         businessNumber: '',
  //         ceoName: '',
  //         bankName: '',
  //         accountNumber: '',
  //         accountHolder: '',
  //         deleted: false,
  //       },
  //       ...deletedCompanies,
  //       ...normalCompanies,
  //     ])

  //     setField('CompanyId', client.outsourcingCompany?.id ?? 0)
  //   } else if (!isEditMode) {
  //     setUpdatedCompanyOptions(companyOptions)
  //     setField('CompanyId', 0) // "선택" 기본값
  //   }
  // }, [contractDetailData, isEditMode, companyOptions])

  useEffect(() => {
    reset()

    if (contractDetailData && isEditMode === true) {
      const client = contractDetailData.data

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

      setField('siteName', client.site?.name)
      setField('processName', client.siteProcess?.name)
      setField('CompanyName', client.outsourcingCompany?.name)
      setField('businessNumber', client.outsourcingCompany?.businessNumber)
      setField('type', client?.typeCode)
      setField('typeDescription', client?.typeDescription)
      setField('contractName', client?.contractName)

      setField('workTypeName', client?.workTypeName)
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
      // setField('category', client.categoryCode || '')

      // 상태
      setField('status', client.statusCode || '')

      // 비고
      setField('memo', client.memo || '')
      setField('headManagers', formattedContacts)
      setField('attachedFiles', formattedFiles)

      if (client.type === '노무') {
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
      } else if (client.type === '외주') {
        const contractData = contractConstructionDetailData?.data

        if (contractData) {
          // OutsourcingContractItem[] 구조를 기반으로 변환
          const getContractItems = (contractData.content ?? []).map(
            (outsourcingItem: OutsourcingContractItem) => ({
              id: outsourcingItem.id,
              itemName: outsourcingItem.itemName,
              items: (outsourcingItem.items ?? []).map((detail) => ({
                id: detail.id,
                item: detail.item,
                specification: detail.specification,
                unit: detail.unit,
                unitPrice: detail.unitPrice,
                contractQuantity: detail.contractQuantity,
                contractPrice: detail.contractPrice,
                outsourcingContractQuantity: detail.outsourcingContractQuantity,
                outsourcingContractUnitPrice: detail.outsourcingContractUnitPrice,
                outsourcingContractPrice: detail.outsourcingContractPrice,
                memo: detail.memo,
              })),
            }),
          )

          setField('contractManagers', getContractItems)
        }

        const Equipment = contractEquipmentDetailData?.data

        if (Equipment) {
          const getEquipmentItems = (Equipment.content ?? []).map(
            (item: OutsourcingEquipmentInfoAttachedFile) => ({
              id: item.id,
              specification: item.specification,
              vehicleNumber: item.vehicleNumber,
              category: item.category,
              unitPrice: item.unitPrice,
              type: item.typeCode,
              // subtotal: item.subtotal,
              taskDescription: item.taskDescription,
              memo: item.memo,
              subEquipments: (item.subEquipments ?? []).map((sub) => ({
                id: sub.id,
                type: sub.typeCode,
                taskDescription: sub.taskDescription,
                description: sub.description,
                unitPrice: sub.unitPrice,
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

          setField('articleManagers', getArticleItems)
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
              type: item.typeCode,
              // subtotal: item.subtotal,
              taskDescription: item.taskDescription,
              memo: item.memo,
              subEquipments: (item.subEquipments ?? []).map((sub) => ({
                id: sub.id,
                type: sub.typeCode,
                taskDescription: sub.taskDescription,
                description: sub.description,
                unitPrice: sub.unitPrice,
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

          setField('articleManagers', getArticleItems)
        }
      } else if (
        client.type === '기타' ||
        client.type === '재료' ||
        client.type === '유류' ||
        client.type === '관리'
      ) {
        const etcFiles = (client.files ?? []).map((item: OutsourcingContractAttachedFile) => ({
          id: item.id,
          name: item.name,
          memo: item.memo,
          type: item.typeCode,
          files: [
            {
              fileUrl: item.fileUrl && item.fileUrl.trim() !== '' ? item.fileUrl : null,
              originalFileName:
                item.originalFileName && item.originalFileName.trim() !== ''
                  ? item.originalFileName
                  : null,
            },
          ],
        }))

        setField('attachedFiles', etcFiles)
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
  ])

  const [isSiteFocused, setIsSiteFocused] = useState(false)

  const debouncedSiteKeyword = useDebouncedValue(form.siteName, 300)

  const {
    data: SiteNameData,
    fetchNextPage: SiteNameFetchNextPage,
    hasNextPage: SiteNameHasNextPage,
    isFetching: SiteNameIsFetching,
    isLoading: SiteNameIsLoading,
  } = useSitePersonNameListInfiniteScroll(debouncedSiteKeyword)

  const SiteRawList = SiteNameData?.pages.flatMap((page) => page.data.content) ?? []
  const siteList = Array.from(new Map(SiteRawList.map((user) => [user.name, user])).values())

  // 업체명 이름 키워드

  // 업체명 키워드 검색

  const [isOutsourcingFocused, setIsOutsourcingFocused] = useState(false)

  const debouncedOutsourcingKeyword = useDebouncedValue(form.CompanyName, 300)

  const {
    data: OutsourcingNameData,
    fetchNextPage: OutsourcingeNameFetchNextPage,
    hasNextPage: OutsourcingNameHasNextPage,
    isFetching: OutsourcingNameIsFetching,
    isLoading: OutsourcingNameIsLoading,
  } = useOutsourcingNameListInfiniteScroll(debouncedOutsourcingKeyword)

  const OutsourcingRawList = OutsourcingNameData?.pages.flatMap((page) => page.data.content) ?? []
  const outsourcingList = Array.from(
    new Map(OutsourcingRawList.map((user) => [user.name, user])).values(),
  )

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
      const allHistories = outsourcingContractHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          type: item.type || '-',
          isEditable: item.isEditable,
          content:
            formatChangeDetail(item.getChanges) === '-'
              ? item?.description
              : formatChangeDetail(item.getChanges), // 여기 변경
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          updatedBy: item.updatedBy,
          memo: item.memo ?? '',
        })),
      )
      setField('changeHistories', allHistories)
    }
  }, [
    outsourcingContractHistoryList,
    setField,
    contractDetailData,
    outsourcingPersonList,
    contractConstructionDetailData,
    contractEquipmentDetailData,
    contractDriverDetailData,
    isEditMode,
  ])

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

    if (form.category !== 'SERVICE' && !form.contractAmount) {
      return '계약금액을 입력해주세요.'
    }

    // if (!(form.defaultDeductions?.split(',').filter(Boolean)?.length > 0)) {
    //   return '기본공제 항목을 선택해주세요.'
    // }

    if (!form.taxCalculat?.trim()) return '세금계산서 발행조건을 입력하세요.'

    if (isChecked && (!form.taxInvoiceIssueDayOfMonth || form.taxInvoiceIssueDayOfMonth <= 0)) {
      return '세금계산서 발행일을 입력해주세요.'
    }

    // if (form.type === 'EQUIPMENT' && !form.category?.trim()) {
    //   return '유형을 선택해주세요.'
    // }

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

    // if (personAddAttachedFiles.length > 0) {
    //   for (const item of personAddAttachedFiles) {
    //     if (!item.name?.trim()) return '인력의 이름을 입력해주세요.'
    //     if (!item.category?.trim()) return '인력의 구분을 입력해주세요.'
    //     if (!item.taskDescription?.trim()) return '인력의 작업내용을 입력해주세요.'
    //     if (item.memo.length > 500) {
    //       return '인력의 비고는 500자 이하로 입력해주세요.'
    //     }
    //   }
    // }

    if (equipmentAddAttachedFiles.length > 0) {
      for (const item of equipmentAddAttachedFiles) {
        // 장비 체크
        if (!item.specification?.trim()) return '장비의 규격을 입력해주세요.'
        if (!item.vehicleNumber?.trim()) return '장비의 차량번호를 입력해주세요.'
        if (!item.category?.trim()) return '장비의 구분을 입력해주세요.'
        // if (!item.subtotal) return '장비의 소계를 입력해주세요.'
        if (item.memo.length > 500) return '장비의 비고는 500자 이하로 입력해주세요.'

        // 'EQUIPMENT' 타입일 때만 유효성 검사 실행
        if (form.type === 'EQUIPMENT') {
          if (!item.unitPrice) return '장비의 단가를 입력해주세요.'
          if (!item.type?.trim() || item.type === 'BASE') {
            return '장비의 구분(유형)을 선택해주세요.'
          }

          if (item.subEquipments?.length) {
            for (const sub of item.subEquipments) {
              if (!sub.type?.trim() || sub.type === 'BASE') {
                return '하위 장비의 유형을 입력해주세요.'
              }

              if (sub.description?.length > 500) {
                return '하위 장비의 비고는 500자 이하로 입력해주세요.'
              }
            }
          }
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
      // for (const item of contractAddAttachedFiles) {
      //   if (!item.item?.trim()) return '공사의 항목을 입력해주세요.'
      //   if (!item.specification?.trim()) return '공사의 규격을 입력해주세요.'
      //   if (!item.unit?.trim()) return '공사의 단가를 입력해주세요.'
      //   if (!item.unitPrice) return '공사의 도급단가를 입력해주세요.'
      //   if (!item.contractQuantity) return '공사의 계약금액의 수량을 입력해주세요.'
      //   if (!item.contractPrice) return '공사의 계약금액의 금액을 입력해주세요.'
      //   if (!item.outsourcingContractQuantity) return '공사의 외주계약금액의 수량을 입력해주세요.'
      //   if (!item.outsourcingContractPrice) return '공사의 외주계약금액의 금액을 입력해주세요.'
      //   if (item.memo.length > 500) {
      //     return '공사의 비고는 500자 이하로 입력해주세요.'
      //   }
      // }
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
    if (form.type === 'EQUIPMENT') {
      if (!equipmentAddAttachedFiles || equipmentAddAttachedFiles.length === 0) {
        showSnackbar('장비 항목을 1개 이상 입력해주세요.', 'warning')
        return
      }
      if (!articleAddAttachedFiles || articleAddAttachedFiles.length === 0) {
        showSnackbar('기사 항목을 1개 이상 입력해주세요.', 'warning')
        return
      }
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
              현장명 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 w-full flex items-center">
              <InfiniteScrollSelect
                disabled={false}
                placeholder="현장명을 입력하세요"
                keyword={form.siteName}
                onChangeKeyword={(newKeyword) => {
                  setField('siteName', newKeyword)

                  // 현장명 지웠을 경우 공정명도 같이 초기화
                  if (newKeyword === '') {
                    setField('processName', '')
                    setField('processId', 0)
                  }
                }}
                items={siteList}
                hasNextPage={SiteNameHasNextPage ?? false}
                fetchNextPage={SiteNameFetchNextPage}
                renderItem={(item, isHighlighted) => (
                  <div className={isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''}>
                    {item.name}
                  </div>
                )}
                // onSelect={handleSelectSiting}
                onSelect={async (selectedSite) => {
                  if (!selectedSite) return

                  // 선택된 현장 세팅
                  setField('siteId', selectedSite.id)
                  setField(
                    'siteName',
                    selectedSite.name + (selectedSite.deleted ? ' (삭제됨)' : ''),
                  )

                  if (selectedSite.deleted) {
                    setField('processName', '')
                    return
                  }

                  try {
                    // 공정 목록 조회
                    const res = await SitesProcessNameScroll({
                      pageParam: 0,
                      siteId: selectedSite.id,
                      keyword: '',
                    })

                    const processes = res.data?.content || []

                    if (processes.length > 0) {
                      // 첫 번째 공정 자동 세팅
                      setField('processName', processes[0].name)
                      setField('processId', processes[0].id)
                    } else {
                      setField('processName', '')
                      setField('processId', 0)
                    }
                  } catch (err) {
                    console.error('공정 조회 실패:', err)
                  }
                }}
                isLoading={SiteNameIsLoading || SiteNameIsFetching}
                debouncedKeyword={debouncedSiteKeyword}
                shouldShowList={isSiteFocused}
                onFocus={() => setIsSiteFocused(true)}
                onBlur={() => setIsSiteFocused(false)}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              공정명 <span className="text-red-500 ml-1">*</span>
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
                disabled
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              업체명 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400  w-full">
              <InfiniteScrollSelect
                placeholder="업체명을 입력하세요"
                keyword={form.CompanyName}
                onChangeKeyword={(newKeyword) => {
                  setField('CompanyName', newKeyword)

                  // 업체명을 지우면 사업자등록번호도 같이 초기화
                  if (newKeyword === '') {
                    setField('businessNumber', '')
                  }
                }}
                items={outsourcingList}
                hasNextPage={OutsourcingNameHasNextPage ?? false}
                fetchNextPage={OutsourcingeNameFetchNextPage}
                renderItem={(item, isHighlighted) => (
                  <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
                    {item.name}
                  </div>
                )}
                onSelect={async (selectedCompany) => {
                  if (!selectedCompany) return

                  setField('CompanyId', selectedCompany.id)
                  setField('CompanyName', selectedCompany.name)

                  if (selectedCompany.deleted) {
                    setField('businessNumber', selectedCompany.businessNumber || '')
                    return
                  }

                  try {
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
                      // setField('defaultDeductions', matched.defaultDeductionsCode)
                      // setField('defaultDeductionsDescription', matched.defaultDeductionsDescription)
                    } else {
                      setField('businessNumber', '')
                    }
                  } catch (err) {
                    console.error('업체 조회 실패:', err)
                    setField('businessNumber', '')
                  }
                }}
                isLoading={OutsourcingNameIsLoading || OutsourcingNameIsFetching}
                debouncedKeyword={debouncedOutsourcingKeyword}
                shouldShowList={isOutsourcingFocused}
                onFocus={() => setIsOutsourcingFocused(true)}
                onBlur={() => setIsOutsourcingFocused(false)}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              사업자등록번호 <span className="text-red-500 ml-1">*</span>
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
              구분 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
              <div className="flex gap-4 items-center">
                <CommonSelect
                  className="min-w-[100px]"
                  value={form.type || 'BASE'}
                  onChange={(value) => {
                    setField('type', value)
                    resetType()

                    if (value !== 'ETC') {
                      setField('typeDescription', '')
                    }
                  }}
                  options={typeMethodOptions}
                  disabled={isEditMode}
                />

                {form.type === 'EQUIPMENT' && (
                  <div className="flex items-center w-full">
                    <label className="w-20 text-[16px] flex items-center justify-center font-bold text-center">
                      계약명
                    </label>
                    <div className="py-2 w-full flex justify-center items-center">
                      <CommonInput
                        className="w-[100px]" // 원하는 너비 지정
                        fullWidth
                        value={form.contractName}
                        onChange={(value) => setField('contractName', value)}
                      />
                    </div>
                  </div>
                )}

                {form.type === 'CONSTRUCTION' && (
                  <div className="flex items-center w-full">
                    <label className="w-20 text-[16px] flex items-center justify-center font-bold text-center">
                      계약명
                    </label>
                    <div className="py-2 w-full flex justify-center items-center">
                      <CommonInput
                        className="w-[100px]" // 원하는 너비 지정
                        fullWidth
                        value={form.contractName}
                        onChange={(value) => setField('contractName', value)}
                      />
                    </div>
                  </div>
                )}

                {form.type !== 'CONSTRUCTION' && form.type !== 'EQUIPMENT' && (
                  <CommonInput
                    value={form.typeDescription}
                    onChange={(value) => setField('typeDescription', value)}
                    className="flex-1"
                    disabled={isEditMode || form.type !== 'ETC'}
                    placeholder={form.type === 'ETC' ? '기타 내용을 입력하세요' : ''}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[13px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계약기간(시작/종료) <span className="text-red-500 ml-1">*</span>
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
              {form.type === 'SERVICE' ? (
                <>계약금액(총액)</>
              ) : (
                <>
                  계약금액(총액)
                  <span className="text-red-500 ml-1">*</span>
                </>
              )}
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
            <label className="w-[119px] 2xl:w-[125px] text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
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
            <label className="w-36 text-[13px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
              세금계산서 발행조건 <span className="text-red-500 ml-1">*</span>
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

          {/* {form.type === 'EQUIPMENT' && (
            <div className="flex">
              <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
                유형 <span className="text-red-500 ml-1">*</span>
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
          )} */}

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              상태 <span className="text-red-500 ml-1">*</span>
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
          {form.type === 'CONSTRUCTION' && (
            <div className="flex">
              <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
                공종명
              </label>
              <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
                <CommonInput
                  value={form.workTypeName ?? ''}
                  onChange={(value) => {
                    setField('workTypeName', value)
                  }}
                  className=" flex-1"
                />
              </div>
            </div>
          )}

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
                    {label === '비고' ? (
                      label
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>{label}</span>
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                    )}
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
                    {label === '비고' || label === '첨부' ? (
                      label
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>{label}</span>
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                    )}
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
                          'txt',
                          'rtf',
                          'docx',
                          'hwp',
                          'xlsx',
                          'csv',
                          'ods',
                          'pptx',
                          'ppt',
                          'odp',
                          'jpg',
                          'jpeg',
                          'png',
                          'gif',
                          'tif',
                          'tiff',
                          'bmp',
                          'zip',
                          '7z',
                          'mp3',
                          'wav',
                          'mp4',
                          'mov',
                          'avi',
                          'wmv',
                          'dwg',
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

      {/*
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
                      {label === '비고' || label === '관련서류' ? (
                        label
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>{label}</span>
                          <span className="text-red-500 ml-1">*</span>
                        </div>
                      )}
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
                            'txt',
                            'rtf',
                            'docx',
                            'hwp',
                            'xlsx',
                            'csv',
                            'ods',
                            'pptx',
                            'ppt',
                            'odp',
                            'jpg',
                            'jpeg',
                            'png',
                            'gif',
                            'tif',
                            'tiff',
                            'bmp',
                            'zip',
                            '7z',
                            'mp3',
                            'wav',
                            'mp4',
                            'mov',
                            'avi',
                            'wmv',
                            'dwg',
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
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      */}
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
                    항목명 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    항목 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    규격 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    단위 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    도급단가 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    도급금액 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    외주계약금액 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    비고
                  </TableCell>

                  <TableCell
                    rowSpan={2}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    -
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    수량 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    금액 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    수량 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    단가 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    금액 <span className="text-red-500 ml-1">*</span>
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

                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      <div className="flex gap-2 mt-1 items-center">
                        <TextField
                          size="small"
                          placeholder="텍스트 입력(50자)"
                          value={m.itemName || ''}
                          onChange={(e) =>
                            updateItemField('workSize', m.id, 'itemName', e.target.value)
                          }
                          inputProps={{ maxLength: 50 }}
                          fullWidth
                        />
                      </div>
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      {m.items.map((item) => (
                        <div key={item.id} className="flex gap-2 mt-1 items-center">
                          <TextField
                            size="small"
                            placeholder="텍스트 입력(50자)"
                            value={item.item || ''}
                            onChange={(e) =>
                              updateContractDetailField(m.id, item.id, 'item', e.target.value)
                            }
                            inputProps={{ maxLength: 50 }}
                            fullWidth
                          />
                        </div>
                      ))}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      {m.items.map((item) => (
                        <div key={item.id} className="flex gap-2 mt-1 items-center">
                          <TextField
                            size="small"
                            placeholder="텍스트 입력(50자)"
                            value={item.specification || ''}
                            onChange={(e) =>
                              updateContractDetailField(
                                m.id,
                                item.id,
                                'specification',
                                e.target.value,
                              )
                            }
                            inputProps={{ maxLength: 50 }}
                            fullWidth
                          />
                        </div>
                      ))}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      {m.items.map((item) => (
                        <div key={item.id} className="flex gap-2 mt-1 items-center">
                          <TextField
                            size="small"
                            placeholder="10자"
                            value={item.unit || ''}
                            onChange={(e) =>
                              updateContractDetailField(m.id, item.id, 'unit', e.target.value)
                            }
                            inputProps={{ maxLength: 10 }}
                            fullWidth
                          />
                        </div>
                      ))}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      {m.items.map((item) => (
                        <div key={item.id} className="flex gap-2 mt-1 items-center">
                          <TextField
                            size="small"
                            placeholder="숫자만"
                            value={formatNumber(item.unitPrice)}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)

                              updateContractDetailField(m.id, item.id, 'unitPrice', numericValue)
                            }}
                            inputProps={{
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              style: { textAlign: 'right' }, // ← 오른쪽 정렬
                            }}
                            fullWidth
                          />
                        </div>
                      ))}
                    </TableCell>

                    {/* 도급금액 수량 */}
                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      {m.items.map((item) => (
                        <div key={item.id} className="flex gap-2 mt-1 items-center">
                          <TextField
                            size="small"
                            placeholder="숫자만"
                            value={formatNumber(item.contractQuantity)}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)

                              updateContractDetailField(
                                m.id,
                                item.id,
                                'contractQuantity',
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
                        </div>
                      ))}
                    </TableCell>

                    {/* 도급금액 금액 */}
                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      {m.items.map((item) => (
                        <div key={item.id} className="flex gap-2 mt-1 items-center">
                          <TextField
                            size="small"
                            placeholder="숫자만"
                            value={formatNumber(item.contractPrice)}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)

                              updateContractDetailField(
                                m.id,
                                item.id,
                                'contractPrice',
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
                        </div>
                      ))}
                    </TableCell>

                    {/* 외주계약금액 수량 */}
                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      {m.items.map((item) => (
                        <div key={item.id} className="flex gap-2 mt-1 items-center">
                          <TextField
                            size="small"
                            placeholder="숫자만"
                            value={formatNumber(item.outsourcingContractQuantity)}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)

                              updateContractDetailField(
                                m.id,
                                item.id,
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
                        </div>
                      ))}
                    </TableCell>

                    {/* 외주계약금액에 단가  */}

                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      {m.items.map((item) => (
                        <div key={item.id} className="flex gap-2 mt-1 items-center">
                          <TextField
                            size="small"
                            placeholder="숫자만"
                            value={formatNumber(item.outsourcingContractUnitPrice)}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)

                              updateContractDetailField(
                                m.id,
                                item.id,
                                'outsourcingContractUnitPrice',
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
                        </div>
                      ))}
                    </TableCell>

                    {/* 외주계약금액 금액 */}
                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      {m.items.map((item) => (
                        <div key={item.id} className="flex gap-2 mt-1 items-center">
                          <TextField
                            size="small"
                            placeholder="숫자만"
                            value={formatNumber(item.outsourcingContractPrice)}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateContractDetailField(
                                m.id,
                                item.id,
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
                        </div>
                      ))}
                    </TableCell>

                    {/* 비고 */}
                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                    >
                      {m.items.map((item) => (
                        <div key={item.id} className="flex gap-2 mt-1 items-center">
                          <TextField
                            size="small"
                            placeholder="500자 이하"
                            multiline
                            value={item.memo || ''}
                            onChange={(e) =>
                              updateContractDetailField(m.id, item.id, 'memo', e.target.value)
                            }
                            inputProps={{ maxLength: 500 }}
                            fullWidth
                          />
                        </div>
                      ))}
                    </TableCell>

                    <TableCell
                      sx={{
                        width: '100px',
                        verticalAlign: 'top',
                        paddingTop: '0px',
                        paddingBottom: '0px',
                      }}
                    >
                      {m.items.map((detail, index) => (
                        <div key={detail.id} className="flex items-center gap-2 mt-1">
                          {/* 버튼 조건부 렌더링 */}
                          {index === 0 ? (
                            <CommonButton
                              label="추가"
                              className="px-7 whitespace-nowrap mt-2"
                              variant="primary"
                              onClick={() => addContractDetailItem(m.id)}
                            />
                          ) : (
                            <CommonButton
                              label="삭제"
                              className="px-7 mt-[10px]"
                              variant="danger"
                              onClick={() => removeContractDetailItem(m.id, detail.id)}
                            />
                          )}
                        </div>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                  <TableCell
                    colSpan={6}
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
                    {getTotalOutsourcePrices().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getTotalOutsourceAmount().toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #9CA3AF' }} />
                  <TableCell sx={{ border: '1px solid #9CA3AF' }} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 외주에서 장비를 넣는다. */}
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
                    {[
                      '장비명(규격)',
                      '차량번호',
                      '추가장비',
                      '단가',
                      '유형',
                      '작업내용',
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
                        }}
                      >
                        {label === '비고' ||
                        label === '작업내용' ||
                        label === '단가' ||
                        label === '유형' ? (
                          label
                        ) : (
                          <div className="flex items-center justify-center">
                            <span>{label}</span>
                            <span className="text-red-500 ml-1">*</span>
                          </div>
                        )}
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
                      <TableCell
                        sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        align="center"
                      >
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
                      <TableCell
                        sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        align="center"
                      >
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
                            disabled
                          />
                        </div>
                      </TableCell>

                      <TableCell
                        sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        align="center"
                      >
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
                          disabled
                        />
                      </TableCell>

                      <TableCell
                        sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        align="center"
                      >
                        <CommonSelect
                          className="text-2xl"
                          value={m.type || 'BASE'}
                          onChange={(value) => updateItemField('equipment', m.id, 'type', value)}
                          options={categoryMethodOptions}
                          disabled
                        />
                      </TableCell>

                      <TableCell
                        sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        align="center"
                      >
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

                      <TableCell
                        sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        align="center"
                      >
                        <TextField
                          size="small"
                          placeholder="500자 이하 텍스트 입력"
                          sx={{ width: '100%' }}
                          value={m.memo}
                          onChange={(e) =>
                            updateItemField('equipment', m.id, 'memo', e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* 외주에서 기사를 넣는다  */}

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
                    {['이름', '기사자격증', '안전교육', '기타서류', '비고'].map((label) => (
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
                        {label === '비고' ||
                        label === '기사자격증' ||
                        label === '안전교육' ||
                        label === '기타서류' ? (
                          label
                        ) : (
                          <div className="flex items-center justify-center">
                            <span>{label}</span>
                            <span className="text-red-500 ml-1">*</span>
                          </div>
                        )}
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
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'ppt',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              'zip',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
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
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'ppt',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              'zip',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
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
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'ppt',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              'zip',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
                            ]}
                            files={m.ETCfiles} // 각 항목별 files
                            onChange={
                              (newFiles) =>
                                updateItemField('articleInfo', m.id, 'ETCfiles', newFiles) //  해당 항목만 업데이트
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
        </>
      )}

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
                  {['규격', '차량번호', '추가장비', '단가', '유형', '작업내용', '비고'].map(
                    (label) => (
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
                        {label === '비고' || label === '작업내용' ? (
                          label
                        ) : (
                          <div className="flex items-center justify-center">
                            <span>{label}</span>
                            <span className="text-red-500 ml-1">*</span>
                          </div>
                        )}
                      </TableCell>
                    ),
                  )}
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
                    <TableCell
                      sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                      align="center"
                    >
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
                    <TableCell
                      sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                      align="center"
                    >
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
                          disabled
                        />
                        <CommonButton
                          label="추가"
                          variant="primary"
                          onClick={() => addSubEquipment(m.id)}
                          className="whitespace-nowrap"
                        />
                      </div>

                      {m.subEquipments &&
                        m.subEquipments.map((item, idx) => {
                          // 현재 선택된 다른 subEquipments 값들
                          const selectedTypes = (m.subEquipments ?? [])
                            .filter((i) => i.id !== item.id)
                            .map((i) => i.type)

                          // 중복된 값 제거
                          const filteredOptions = EquipmentType.filter(
                            (opt) => !selectedTypes.includes(opt.code), // opt.value 기준으로 중복 제거
                          )

                          return (
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
                                  value={item.type || 'BASE'}
                                  onChange={(value) =>
                                    updateSubEquipmentField(m.id, item.id, 'type', value)
                                  }
                                  options={filteredOptions}
                                />
                                <TextField
                                  size="small"
                                  value={item.description ?? ''}
                                  onChange={(e) =>
                                    updateSubEquipmentField(
                                      m.id,
                                      item.id,
                                      'description',
                                      e.target.value,
                                    )
                                  }
                                  disabled={item.type !== 'ETC'} // 🔥 '기타'일 때만 활성화
                                  placeholder={item.type === 'ETC' ? '기타 내용을 입력하세요' : ''}
                                />

                                <CommonButton
                                  label="삭제"
                                  variant="danger"
                                  onClick={() => removeSubEquipment(m.id, item.id)}
                                  className="whitespace-nowrap"
                                />
                              </div>
                            </div>
                          )
                        })}
                    </TableCell>

                    <TableCell
                      sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                      align="center"
                    >
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

                      {m.subEquipments?.map((item) => (
                        <div key={item.id} className="mt-2">
                          <TextField
                            size="small"
                            placeholder="단가 입력"
                            value={formatNumber(item.unitPrice ?? 0)}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateSubEquipmentField(m.id, item.id, 'unitPrice', numericValue)
                            }}
                            inputProps={{
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              style: { textAlign: 'right' }, // ← 오른쪽 정렬
                            }}
                            fullWidth
                          />
                        </div>
                      ))}
                    </TableCell>

                    <TableCell
                      sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                      align="center"
                    >
                      <CommonSelect
                        className="text-2xl"
                        value={m.type || 'BASE'}
                        onChange={(value) => updateItemField('equipment', m.id, 'type', value)}
                        options={categoryMethodOptions}
                      />
                    </TableCell>

                    <TableCell
                      sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                      align="center"
                    >
                      <TextField
                        size="small"
                        placeholder="작업내용 입력"
                        sx={{ width: '100%' }}
                        value={m.taskDescription}
                        onChange={(e) =>
                          updateItemField('equipment', m.id, 'taskDescription', e.target.value)
                        }
                      />

                      {m.subEquipments?.map((item) => (
                        <div key={item.id} className="mt-2">
                          <TextField
                            size="small"
                            placeholder="작업내용"
                            value={item.taskDescription ?? ''}
                            onChange={(e) =>
                              updateSubEquipmentField(
                                m.id,
                                item.id,
                                'taskDescription',
                                e.target.value,
                              )
                            }
                            sx={{ width: 200 }}
                          />
                        </div>
                      ))}
                    </TableCell>

                    <TableCell
                      sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                      align="center"
                    >
                      <TextField
                        size="small"
                        placeholder="500자 이하 텍스트 입력"
                        sx={{ width: '100%' }}
                        value={m.memo}
                        onChange={(e) => updateItemField('equipment', m.id, 'memo', e.target.value)}
                      />

                      {m.subEquipments?.map((item) => (
                        <div key={item.id} className="mt-2">
                          <TextField
                            size="small"
                            placeholder="500자 이하 텍스트 입력"
                            value={item.memo ?? ''}
                            onChange={(e) =>
                              updateSubEquipmentField(m.id, item.id, 'memo', e.target.value)
                            }
                            sx={{ width: 200 }}
                          />
                        </div>
                      ))}
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
                  {['이름', '기사자격증', '안전교육', '기타서류', '비고'].map((label) => (
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
                      {label === '비고' ||
                      label === '기사자격증' ||
                      label === '안전교육' ||
                      label === '기타서류' ? (
                        label
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>{label}</span>
                          <span className="text-red-500 ml-1">*</span>
                        </div>
                      )}
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
                            'txt',
                            'rtf',
                            'docx',
                            'hwp',
                            'xlsx',
                            'csv',
                            'ods',
                            'pptx',
                            'ppt',
                            'odp',
                            'jpg',
                            'jpeg',
                            'png',
                            'gif',
                            'tif',
                            'tiff',
                            'bmp',
                            'zip',
                            '7z',
                            'mp3',
                            'wav',
                            'mp4',
                            'mov',
                            'avi',
                            'wmv',
                            'dwg',
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
                            'txt',
                            'rtf',
                            'docx',
                            'hwp',
                            'xlsx',
                            'csv',
                            'ods',
                            'pptx',
                            'ppt',
                            'odp',
                            'jpg',
                            'jpeg',
                            'png',
                            'gif',
                            'tif',
                            'tiff',
                            'bmp',
                            'zip',
                            '7z',
                            'mp3',
                            'wav',
                            'mp4',
                            'mov',
                            'avi',
                            'wmv',
                            'dwg',
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
                            'txt',
                            'rtf',
                            'docx',
                            'hwp',
                            'xlsx',
                            'csv',
                            'ods',
                            'pptx',
                            'ppt',
                            'odp',
                            'jpg',
                            'jpeg',
                            'png',
                            'gif',
                            'tif',
                            'tiff',
                            'bmp',
                            'zip',
                            '7z',
                            'mp3',
                            'wav',
                            'mp4',
                            'mov',
                            'avi',
                            'wmv',
                            'dwg',
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
                {historyList?.map((item: HistoryItem) => (
                  <TableRow key={item.id}>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {formatDateTime(item.updatedAt)}
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
                        disabled={!item.isEditable}
                        sx={{
                          '& .MuiInputBase-root': {
                            backgroundColor: item.isEditable ? 'white' : '#e4e4e4', // 비활성화 시 연한 배경
                            color: item.isEditable ? 'inherit' : 'gray', // 비활성화 시 글자색
                          },
                        }}
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
