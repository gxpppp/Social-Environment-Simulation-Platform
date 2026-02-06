import React, { useState, useRef } from 'react'
import { Button, Upload, Modal, Table, Progress, Alert, Space, Typography, Tabs, message } from 'antd'
import { UploadOutlined, FileExcelOutlined, FileTextOutlined, BranchesOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { ImportService, ImportResult, ImportError } from '@/services/import.service'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

interface ImportButtonProps {
  type: 'scenes' | 'agents'
  onSuccess?: (data: any[]) => void
  buttonProps?: React.ComponentProps<typeof Button>
}

export const ImportButton: React.FC<ImportButtonProps> = ({ type, onSuccess, buttonProps }) => {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList.slice(-1))
    setImportResult(null)
  }

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.warning(t('import.noFileSelected'))
      return
    }

    const file = fileList[0].originFileObj
    if (!file) return

    setImporting(true)
    setProgress(0)

    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90))
      }, 200)

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      let config: any = { type: 'excel' }

      if (fileExt === 'csv') {
        config = { type: 'csv', delimiter: ',' }
      } else if (fileExt === 'json') {
        config = { type: 'json' }
      }

      const validator = type === 'scenes' ? ImportService.validateScene : ImportService.validateAgent
      const result = await ImportService.importData(file, config, validator)

      clearInterval(progressInterval)
      setProgress(100)
      setImportResult(result)

      if (result.success && result.imported > 0) {
        message.success(t('import.success', { count: result.imported }))
        onSuccess?.(result.data)
      } else if (result.errors.length > 0) {
        message.warning(t('import.partialSuccess', { imported: result.imported, errors: result.errors.length }))
      }
    } catch (error) {
      message.error(t('import.failed'))
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const columns =
      type === 'scenes'
        ? ['name', 'description', 'type', 'duration', 'timeStep']
        : ['name', 'description', 'role', 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
    ImportService.downloadTemplate(columns, `${type}_template.xlsx`)
    message.success(t('import.templateDownloaded'))
  }

  const errorColumns = [
    { title: t('import.row'), dataIndex: 'row', key: 'row', width: 80 },
    { title: t('import.field'), dataIndex: 'field', key: 'field', width: 120 },
    { title: t('import.value'), dataIndex: 'value', key: 'value', ellipsis: true },
    { title: t('import.message'), dataIndex: 'message', key: 'message' },
  ]

  return (
    <>
      <Button icon={<UploadOutlined />} onClick={() => setIsModalOpen(true)} {...buttonProps}>
        {t('common.import')}
      </Button>

      <Modal
        title={t('import.title', { type: t(`import.types.${type}`) })}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setFileList([])
          setImportResult(null)
          setProgress(0)
        }}
        onOk={handleImport}
        confirmLoading={importing}
        okText={t('import.start')}
        cancelText={t('common.cancel')}
        width={700}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 模板下载 */}
          <Alert
            message={t('import.templateTip')}
            description={
              <Space>
                <Text>{t('import.downloadTemplate')}</Text>
                <Button type="link" onClick={handleDownloadTemplate} icon={<FileExcelOutlined />}>
                  {type === 'scenes' ? t('import.sceneTemplate') : t('import.agentTemplate')}
                </Button>
              </Space>
            }
            type="info"
            showIcon
          />

          {/* 文件上传 */}
          <Upload.Dragger
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false}
            accept=".xlsx,.xls,.csv,.json"
            maxCount={1}
          >
            <p className="ant-upload-drag-icon">
              <BranchesOutlined />
            </p>
            <p className="ant-upload-text">{t('import.dragOrClick')}</p>
            <p className="ant-upload-hint">{t('import.supportedFormats')}</p>
          </Upload.Dragger>

          {/* 进度条 */}
          {importing && <Progress percent={progress} status="active" />}

          {/* 导入结果 */}
          {importResult && (
            <>
              <Alert
                message={
                  importResult.success
                    ? t('import.allSuccess')
                    : importResult.imported > 0
                      ? t('import.partialSuccessTitle')
                      : t('import.allFailed')
                }
                description={t('import.resultSummary', {
                  total: importResult.total,
                  imported: importResult.imported,
                  errors: importResult.errors.length,
                })}
                type={importResult.success ? 'success' : importResult.imported > 0 ? 'warning' : 'error'}
                showIcon
              />

              {importResult.errors.length > 0 && (
                <Table
                  dataSource={importResult.errors}
                  columns={errorColumns}
                  pagination={{ pageSize: 5 }}
                  size="small"
                  title={() => t('import.errorDetails')}
                />
              )}
            </>
          )}
        </Space>
      </Modal>
    </>
  )
}

export default ImportButton
