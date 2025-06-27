// import UseBusinessModify from '@/hooks/useBusinessModify'
import BusinessRegistrationView from './BusinessRegistrationView'

export default function BusinessModifyView() {
  //   const { initialData } = UseBusinessModify()

  // 여기서는 useBusinessModify 에서 보내주는 리턴 값 뭐 데이터나 초기값 등등 해당 리턴 값을 받아서 비즈니스View의 파라미터로 전달해줌 ..  그럼 이제 그 값으로 수정일떄와 등록일때의 분기처리를 하면됌

  return (
    <>
      <BusinessRegistrationView isEditMode={true} />
    </>
  )
}
