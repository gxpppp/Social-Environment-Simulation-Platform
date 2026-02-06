import React, { useState } from 'react'
import { Button, Dropdown, Modal, message, Space } from 'antd'
import { DownOutlined, DeleteOutlined, CopyOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'

interface BatchOperationsProps<T = any> {
  selectedKeys: React.Key[]
  onClearSelection: () => void
  onDelete?: (keys: React.Key[]) => Promise<void>
  onCopy?: (keys: React.Key[]) => Promise<void>
  onEnable?: (keys: React.Key[]) => Promise<void>
  onDisable?: (keys: React.Key[]) => Promise<void>
  entityName?: string
  children?: React.ReactNode
}

export const BatchOperations: React.FC<BatchOperationsProps> = ({
  selectedKeys,
  onClearSelection,
  onDelete,
  onCopy,
  onEnable,
  onDisable,
  entityName = '项目',
  children,
}) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentAction, setCurrentAction] = useState<string>('')

  const hasSelection = selectedKeys.length > 0

  const handleAction = async (action: string) => {
    if (!hasSelection) {
      message.warning(t('batch.noSelection'))
      return
    }
    setCurrentAction(action)
    setModalVisible(true)
  }

  const confirmAction = async () => {
    setLoading(true)
    try {
      switch (currentAction) {
        case 'delete':
          await onDelete?.(selectedKeys)
          message.success(t('batch.deleteSuccess', { count: selectedKeys.length }))
          break
        case 'copy':
          await onCopy?.(selectedKeys)
          message.success(t('batch.copySuccess', { count: selectedKeys.length }))
          break
        case 'enable':
          await onEnable?.(selectedKeys)
          message.success(t('batch.enableSuccess', { count: selectedKeys.length }))
          break
        case 'disable':
          await onDisable?.(selectedKeys)
          message.success(t('batch.disableSuccess', { count: selectedKeys.length }))
          break
      }
      onClearSelection()
    } catch (error) {
      message.error(t('batch.actionFailed'))
    } finally {
      setLoading(false)
      setModalVisible(false)
    }
  }

  const getModalContent = () => {
    switch (currentAction) {
      case 'delete':
        return {
          title: t('batch.confirmDelete'),
          content: t('batch.deleteConfirmContent', { count: selectedKeys.length, entity: entityName }),
          okText: t('common.delete'),
          okButtonProps: { danger: true },
        }
      case 'copy':
        return {
          title: t('batch.confirmCopy'),
          content: t('batch.copyConfirmContent', { count: selectedKeys.length, entity: entityName }),
          okText: t('common.confirm'),
        }
      case 'enable':
        return {
          title: t('batch.confirmEnable'),
          content: t('batch.enableConfirmContent', { count: selectedKeys.length, entity: entityName }),
          okText: t('common.confirm'),
        }
      case 'disable':
        return {
          title: t('batch.confirmDisable'),
          content: t('batch.disableConfirmContent', { count: selectedKeys.length, entity: entityName }),
          okText: t('common.confirm'),
        }
      default:
        return { title: '', content: '', okText: '' }
    }
  }

  const items: MenuProps['items'] = [
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('batch.delete'),
      danger: true,
      onClick: () => handleAction('delete'),
    },
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: t('batch.copy'),
      onClick: () => handleAction('copy'),
    },
    {
      type: 'divider',
    },
    {
      key: 'enable',
      icon: <CheckCircleOutlined />,
      label: t('batch.enable'),
      onClick: () => handleAction('enable'),
    },
    {
      key: 'disable',
      icon: <StopOutlined />,
      label: t('batch.disable'),
      onClick: () => handleAction('disable'),
    },
  ]

  const modalContent = getModalContent()

  return (
    <>
      <Space>
        {children}
        {hasSelection && (
          <span style={{ color: '#1890ff' }}>
            {t('batch.selected', { count: selectedKeys.length })}
          </span>
        )}
        <Dropdown menu={{ items }} disabled={!hasSelection}>
          <Button>
            {t('common.batch')} <DownOutlined />
          </Button>
        </Dropdown>
      </Space>

      <Modal
        title={modalContent.title}
        open={modalVisible}
        onOk={confirmAction}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        okText={modalContent.okText}
        cancelText={t('common.cancel')}
        {...modalContent.okButtonProps}
      >
        <p>{modalContent.content}</p>
      </Modal>
    </>
  )
}

export default BatchOperations
