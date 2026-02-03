import React from 'react'
import { Card, Select, Slider, Typography, Tag, Checkbox, Row, Col, Tooltip } from 'antd'
import { BookOutlined, GlobalOutlined, ReadOutlined } from '@ant-design/icons'

const { Text } = Typography
const { Option } = Select

interface KnowledgeConfigProps {
  value: {
    domains: string[]
    depth: number
    sources: string[]
  }
  onChange: (value: { domains: string[]; depth: number; sources: string[] }) => void
}

// 知识领域选项
const knowledgeDomains = [
  { value: 'politics', label: '政治', icon: '🏛️', description: '政策法规、政府运作、政治理论' },
  { value: 'economics', label: '经济', icon: '💰', description: '宏观经济、金融市场、商业运营' },
  { value: 'technology', label: '科技', icon: '🔬', description: '信息技术、工程技术、科学研究' },
  { value: 'culture', label: '文化', icon: '🎭', description: '艺术、文学、历史、传统文化' },
  { value: 'society', label: '社会', icon: '👥', description: '社会学、心理学、社会关系' },
  { value: 'environment', label: '环境', icon: '🌱', description: '环境保护、气候变化、可持续发展' },
  { value: 'health', label: '健康', icon: '🏥', description: '医疗健康、公共卫生、养生保健' },
  { value: 'education', label: '教育', icon: '📚', description: '教育体系、教学方法、学术研究' },
  { value: 'media', label: '媒体', icon: '📺', description: '新闻传播、社交媒体、舆论传播' },
  { value: 'law', label: '法律', icon: '⚖️', description: '法律法规、司法体系、权利义务' },
]

// 信息源选项
const informationSources = [
  { value: 'official', label: '官方渠道', description: '政府公告、官方媒体、权威机构' },
  { value: 'mainstream', label: '主流媒体', description: '电视、报纸、主流新闻网站' },
  { value: 'social', label: '社交媒体', description: '微博、微信、抖音、小红书' },
  { value: 'professional', label: '专业平台', description: '行业报告、学术期刊、专业论坛' },
  { value: 'word_of_mouth', label: '口口相传', description: '亲友推荐、社区讨论、邻里交流' },
  { value: 'international', label: '国际媒体', description: '国际新闻、外媒报道、跨境信息' },
]

// 知识深度标签
const getDepthLabel = (depth: number): string => {
  if (depth < 0.25) return '初学者'
  if (depth < 0.5) return '了解'
  if (depth < 0.75) return '熟悉'
  return '专家'
}

const getDepthColor = (depth: number): string => {
  if (depth < 0.25) return 'default'
  if (depth < 0.5) return 'processing'
  if (depth < 0.75) return 'warning'
  return 'success'
}

export const KnowledgeConfig: React.FC<KnowledgeConfigProps> = ({
  value,
  onChange,
}) => {
  const handleDomainsChange = (selectedDomains: string[]) => {
    onChange({
      ...value,
      domains: selectedDomains,
    })
  }

  const handleDepthChange = (newDepth: number) => {
    onChange({
      ...value,
      depth: newDepth / 100,
    })
  }

  const handleSourcesChange = (selectedSources: string[]) => {
    onChange({
      ...value,
      sources: selectedSources,
    })
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* 知识领域 */}
        <Col span={12}>
          <Card 
            title={<><BookOutlined /> 知识领域</>} 
            bordered={false}
            extra={<Text type="secondary">可多选</Text>}
          >
            <Select
              mode="multiple"
              placeholder="选择知识领域"
              value={value.domains}
              onChange={handleDomainsChange}
              style={{ width: '100%' }}
              optionLabelProp="label"
            >
              {knowledgeDomains.map((domain) => (
                <Option 
                  key={domain.value} 
                  value={domain.value}
                  label={`${domain.icon} ${domain.label}`}
                >
                  <Tooltip title={domain.description} placement="right">
                    <div>
                      <span style={{ marginRight: 8 }}>{domain.icon}</span>
                      <strong>{domain.label}</strong>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {domain.description}
                      </div>
                    </div>
                  </Tooltip>
                </Option>
              ))}
            </Select>

            {/* 已选领域标签 */}
            <div style={{ marginTop: 16, minHeight: 32 }}>
              {value.domains.length > 0 ? (
                value.domains.map((domainValue) => {
                  const domain = knowledgeDomains.find((d) => d.value === domainValue)
                  return domain ? (
                    <Tag 
                      key={domainValue} 
                      color="blue"
                      style={{ margin: '4px 8px 4px 0' }}
                    >
                      {domain.icon} {domain.label}
                    </Tag>
                  ) : null
                })
              ) : (
                <Text type="secondary">请选择至少一个知识领域</Text>
              )}
            </div>
          </Card>
        </Col>

        {/* 知识深度 */}
        <Col span={12}>
          <Card title={<><ReadOutlined /> 知识深度</>} bordered={false}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Tag color={getDepthColor(value.depth)} style={{ fontSize: 16, padding: '4px 12px' }}>
                {getDepthLabel(value.depth)}
              </Tag>
            </div>

            <Slider
              value={value.depth * 100}
              onChange={handleDepthChange}
              min={0}
              max={100}
              step={1}
              marks={{
                0: '初学者',
                25: '了解',
                50: '熟悉',
                75: '精通',
                100: '专家',
              }}
              tooltip={{ formatter: (val) => `${val}%` }}
            />

            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <Text type="secondary">
                {getDepthDescription(value.depth)}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 信息源偏好 */}
      <Card 
        title={<><GlobalOutlined /> 信息源偏好</>} 
        style={{ marginTop: 24 }}
        bordered={false}
        extra={<Text type="secondary">影响信息获取和观点形成</Text>}
      >
        <Checkbox.Group
          value={value.sources}
          onChange={handleSourcesChange}
          style={{ width: '100%' }}
        >
          <Row gutter={[16, 16]}>
            {informationSources.map((source) => (
              <Col span={8} key={source.value}>
                <Tooltip title={source.description} placement="top">
                  <div 
                    style={{ 
                      padding: 12, 
                      border: '1px solid #d9d9d9', 
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    className="source-option"
                  >
                    <Checkbox value={source.value}>
                      <strong>{source.label}</strong>
                    </Checkbox>
                    <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
                      {source.description}
                    </div>
                  </div>
                </Tooltip>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Card>

      {/* 知识配置摘要 */}
      <Card title="知识配置摘要" style={{ marginTop: 24 }} bordered={false}>
        <KnowledgeSummary domains={value.domains} depth={value.depth} sources={value.sources} />
      </Card>
    </div>
  )
}

// 知识深度描述
const getDepthDescription = (depth: number): string => {
  if (depth < 0.25) {
    return '对该领域有基本的了解，知道常见概念和术语，能够进行简单的交流。'
  }
  if (depth < 0.5) {
    return '对该领域有较全面的了解，能够理解核心概念，关注相关新闻和动态。'
  }
  if (depth < 0.75) {
    return '对该领域有深入的理解，能够分析复杂问题，形成自己的见解。'
  }
  return '该领域的专家，具有专业知识和丰富经验，能够解决复杂问题，指导他人。'
}

// 知识配置摘要组件
const KnowledgeSummary: React.FC<{
  domains: string[]
  depth: number
  sources: string[]
}> = ({ domains, depth, sources }) => {
  const getExpertiseLevel = () => {
    const domainCount = domains.length
    const depthLevel = depth

    if (domainCount >= 5 && depthLevel >= 0.75) {
      return '博学型专家'
    }
    if (domainCount >= 5 && depthLevel >= 0.5) {
      return '知识面广的通才'
    }
    if (domainCount <= 2 && depthLevel >= 0.75) {
      return '专业型专家'
    }
    if (depthLevel < 0.3) {
      return '普通大众'
    }
    return '有一定专长的普通人'
  }

  const getInformationDiet = () => {
    const hasOfficial = sources.includes('official')
    const hasMainstream = sources.includes('mainstream')
    const hasSocial = sources.includes('social')

    if (hasOfficial && hasMainstream && !hasSocial) {
      return '传统权威型'
    }
    if (hasSocial && !hasOfficial && !hasMainstream) {
      return '社交媒体型'
    }
    if (sources.length >= 4) {
      return '多元信息型'
    }
    return '单一信息源型'
  }

  return (
    <div>
      <Row gutter={[24, 16]}>
        <Col span={12}>
          <Text strong>知识特征：</Text>
          <Tag color="blue" style={{ marginLeft: 8 }}>
            {getExpertiseLevel()}
          </Tag>
        </Col>
        <Col span={12}>
          <Text strong>信息获取习惯：</Text>
          <Tag color="green" style={{ marginLeft: 8 }}>
            {getInformationDiet()}
          </Tag>
        </Col>
      </Row>
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          该角色在{domains.length}个领域具有{getDepthLabel(depth)}级别的知识，
          主要通过{sources.length}类信息渠道获取信息。
          在模拟中将基于这些特征形成观点和做出决策。
        </Text>
      </div>
    </div>
  )
}
