import React, { useState } from 'react';
import { Button, Dropdown, Menu, Modal, Space, Typography, Radio, message } from 'antd';
import { 
  DownloadOutlined, 
  FileExcelOutlined, 
  FileTextOutlined, 
  FileOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import { ExportService } from '@/services/export.service';

const { Text, Title } = Typography;

// 导出按钮属性接口
interface ExportButtonProps {
  // 数据类型
  dataType: 'agents' | 'events' | 'network' | 'simulation';
  // 数据
  data: any;
  // 按钮文字
  buttonText?: string;
  // 按钮类型
  buttonType?: 'primary' | 'default' | 'dashed' | 'link';
  // 按钮大小
  size?: 'small' | 'middle' | 'large';
  // 自定义文件名
  filename?: string;
  // 导出前回调
  onBeforeExport?: () => boolean | Promise<boolean>;
  // 导出成功回调
  onExportSuccess?: () => void;
  // 导出失败回调
  onExportError?: (error: any) => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  dataType,
  data,
  buttonText = '导出数据',
  buttonType = 'default',
  size = 'middle',
  filename,
  onBeforeExport,
  onExportSuccess,
  onExportError,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'json'>('excel');
  const [loading, setLoading] = useState(false);

  // 处理导出
  const handleExport = async () => {
    try {
      // 导出前检查
      if (onBeforeExport) {
        const canExport = await onBeforeExport();
        if (!canExport) return;
      }

      setLoading(true);

      // 根据数据类型执行导出
      switch (dataType) {
        case 'agents':
          ExportService.exportAgentList(data, exportFormat);
          break;
        case 'events':
          ExportService.exportEventList(data, exportFormat);
          break;
        case 'network':
          ExportService.exportNetworkData(data, exportFormat as 'excel' | 'json');
          break;
        case 'simulation':
          ExportService.exportSimulationResult(data, exportFormat);
          break;
        default:
          message.error('未知的数据类型');
          return;
      }

      onExportSuccess?.();
      setModalVisible(false);
    } catch (error) {
      console.error('Export error:', error);
      message.error('导出失败');
      onExportError?.(error);
    } finally {
      setLoading(false);
    }
  };

  // 快速导出菜单
  const quickExportMenu = (
    <Menu>
      <Menu.Item 
        key="excel" 
        icon={<FileExcelOutlined style={{ color: '#52c41a' }} />}
        onClick={() => {
          setExportFormat('excel');
          setModalVisible(true);
        }}
      >
        导出为 Excel
      </Menu.Item>
      <Menu.Item 
        key="csv" 
        icon={<FileTextOutlined style={{ color: '#faad14' }} />}
        onClick={() => {
          setExportFormat('csv');
          setModalVisible(true);
        }}
      >
        导出为 CSV
      </Menu.Item>
      <Menu.Item 
        key="json" 
        icon={<FileOutlined style={{ color: '#1890ff' }} />}
        onClick={() => {
          setExportFormat('json');
          setModalVisible(true);
        }}
      >
        导出为 JSON
      </Menu.Item>
    </Menu>
  );

  // 获取数据类型说明
  const getDataTypeDescription = () => {
    const descriptions: Record<string, string> = {
      agents: 'Agent列表数据',
      events: '事件数据',
      network: '网络数据',
      simulation: '模拟结果数据',
    };
    return descriptions[dataType] || '数据';
  };

  // 获取格式说明
  const getFormatDescription = () => {
    const descriptions: Record<string, { title: string; desc: string }> = {
      excel: {
        title: 'Excel 格式',
        desc: '适合在Excel中打开和编辑，支持多工作表',
      },
      csv: {
        title: 'CSV 格式',
        desc: '纯文本格式，兼容性好，适合数据分析',
      },
      json: {
        title: 'JSON 格式',
        desc: '结构化数据格式，适合程序处理',
      },
    };
    return descriptions[exportFormat];
  };

  return (
    <>
      <Dropdown.Button
        type={buttonType}
        size={size}
        icon={<DownloadOutlined />}
        overlay={quickExportMenu}
        onClick={() => setModalVisible(true)}
      >
        {buttonText}
      </Dropdown.Button>

      {/* 导出配置模态框 */}
      <Modal
        title={
          <Space>
            <DownloadOutlined />
            <span>导出{getDataTypeDescription()}</span>
          </Space>
        }
        visible={modalVisible}
        onOk={handleExport}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        okText="确认导出"
        cancelText="取消"
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 格式选择 */}
          <div>
            <Text strong>选择导出格式</Text>
            <Radio.Group 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
              style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <Radio value="excel">
                <Space>
                  <FileExcelOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                  <div>
                    <div>Excel (.xlsx)</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      适合在Excel中打开，支持多工作表
                    </Text>
                  </div>
                </Space>
              </Radio>
              <Radio value="csv">
                <Space>
                  <FileTextOutlined style={{ color: '#faad14', fontSize: 20 }} />
                  <div>
                    <div>CSV (.csv)</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      纯文本格式，兼容性好
                    </Text>
                  </div>
                </Space>
              </Radio>
              <Radio value="json">
                <Space>
                  <FileOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                  <div>
                    <div>JSON (.json)</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      结构化数据，适合程序处理
                    </Text>
                  </div>
                </Space>
              </Radio>
            </Radio.Group>
          </div>

          {/* 导出信息 */}
          <div style={{ 
            padding: 12, 
            background: '#f6ffed', 
            borderRadius: 6,
            border: '1px solid #b7eb8f'
          }}>
            <Space align="start">
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16, marginTop: 3 }} />
              <div>
                <Text strong>即将导出</Text>
                <div>
                  <Text type="secondary">
                    {getFormatDescription().title} · {getDataTypeDescription()}
                  </Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {getFormatDescription().desc}
                  </Text>
                </div>
              </div>
            </Space>
          </div>

          {/* 数据预览 */}
          {data && (
            <div>
              <Text strong>数据概览</Text>
              <div style={{ marginTop: 8 }}>
                {dataType === 'agents' && (
                  <Text type="secondary">共 {data.length} 个Agent</Text>
                )}
                {dataType === 'events' && (
                  <Text type="secondary">共 {data.length} 个事件</Text>
                )}
                {dataType === 'network' && (
                  <Text type="secondary">
                    共 {data.nodes?.length || 0} 个节点，{data.edges?.length || 0} 条边
                  </Text>
                )}
                {dataType === 'simulation' && (
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">Agent: {data.agents?.length || 0} 个</Text>
                    <Text type="secondary">事件: {data.events?.length || 0} 个</Text>
                    <Text type="secondary">指标: {data.metrics?.length || 0} 条</Text>
                  </Space>
                )}
              </div>
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
};

export default ExportButton;
