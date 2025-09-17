import handleApi from '@/api/handleApi'
import { userUrls } from '@/constant/UserUrls'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { closeModal } from '@/redux/reducers/diaglogReducer'
import { RootState } from '@/redux/store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Form, FormInstance, FormProps, Modal } from 'antd'
import React, { useState } from 'react'

interface IFormModal<T> {
  open: boolean
  title: string
  children: React.ReactNode
}


export default function FormModal<T>({ open, title, children }: IFormModal<T>) {
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false)
  const { isOpen, pathApi } = useAppSelector((state: RootState) => state.modal.createUser)
  const dispatch = useAppDispatch()

  console.log(pathApi)

  const onFinish: FormProps<T>['onFinish'] = (values) => {
    console.log(`Success: `, values)
    mutation.mutate(values as any)

  }

  const mutation = useMutation({
    mutationFn: (data) => {
      console.log(data)
      console.log(pathApi)
      return handleApi({ url: pathApi as string, method: 'POST', data })
    },
    onSuccess: () => {
      setConfirmLoading(false)
      queryClient.invalidateQueries({ queryKey: [`${userUrls.getUsers}`] })
      form.resetFields()
      dispatch(closeModal())
    },
    onError: () => {
      setConfirmLoading(false)
      form.resetFields()
      dispatch(closeModal())
    }
  })

  const handleOk = () => {
    setConfirmLoading(true)
    form.submit()
    setTimeout(() => {
      setConfirmLoading(false)
    }, 2000)
  }

  const handleCancel = () => {
    console.log('Clicked cancel button')
    dispatch(closeModal())
  }


  const onFinishFailed: FormProps<T>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Modal
      open={open}
      title={title}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        autoComplete="off"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {children}
      </Form>
    </Modal>
  )
}
