import * as XLSX from 'xlsx';
import { message } from 'antd';

// 导出配置接口
interface ExportConfig {
  filename?: string;
  sheetName?: string;
}

// Excel导出服务
export class ExcelExportService {
  // 导出JSON数据到Excel
  static exportToExcel(data: any[], config: ExportConfig = {}): void {
    const { filename = 'export', sheetName = 'Sheet1' } = config;
    
    try {
      // 创建工作簿
      const wb = XLSX.utils.book_new();
      
      // 创建工作表
      const ws = XLSX.utils.json_to_sheet(data);
      
      // 设置列宽
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length * 2, 15)
      }));
      ws['!cols'] = colWidths;
      
      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // 导出文件
      XLSX.writeFile(wb, `${filename}-${Date.now()}.xlsx`);
      
      message.success('Excel导出成功');
    } catch (error) {
      console.error('Excel export error:', error);
      message.error('Excel导出失败');
    }
  }

  // 导出多个工作表
  static exportMultipleSheets(
    sheets: { name: string; data: any[] }[],
    filename: string = 'export'
  ): void {
    try {
      const wb = XLSX.utils.book_new();
      
      sheets.forEach(sheet => {
        const ws = XLSX.utils.json_to_sheet(sheet.data);
        
        // 设置列宽
        if (sheet.data.length > 0) {
          const colWidths = Object.keys(sheet.data[0]).map(key => ({
            wch: Math.max(key.length * 2, 15)
          }));
          ws['!cols'] = colWidths;
        }
        
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      });
      
      XLSX.writeFile(wb, `${filename}-${Date.now()}.xlsx`);
      message.success('Excel导出成功');
    } catch (error) {
      console.error('Excel export error:', error);
      message.error('Excel导出失败');
    }
  }
}

// CSV导出服务
export class CSVExportService {
  // 导出JSON数据到CSV
  static exportToCSV(data: any[], filename: string = 'export'): void {
    try {
      if (!data || data.length === 0) {
        message.warning('没有数据可导出');
        return;
      }

      // 获取表头
      const headers = Object.keys(data[0]);
      
      // 创建CSV内容
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // 处理包含逗号或引号的值
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // 创建Blob
      const blob = new Blob(['\ufeff' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      // 下载文件
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      message.success('CSV导出成功');
    } catch (error) {
      console.error('CSV export error:', error);
      message.error('CSV导出失败');
    }
  }
}

// JSON导出服务
export class JSONExportService {
  // 导出数据到JSON文件
  static exportToJSON(data: any, filename: string = 'export'): void {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      message.success('JSON导出成功');
    } catch (error) {
      console.error('JSON export error:', error);
      message.error('JSON导出失败');
    }
  }
}

// 统一导出服务
export class ExportService {
  // 导出模拟结果
  static exportSimulationResult(
    simulationData: {
      metadata: any;
      agents: any[];
      events: any[];
      metrics: any[];
    },
    format: 'excel' | 'csv' | 'json' = 'excel'
  ): void {
    const timestamp = Date.now();
    
    switch (format) {
      case 'excel':
        ExcelExportService.exportMultipleSheets([
          { name: '元数据', data: [simulationData.metadata] },
          { name: 'Agent数据', data: simulationData.agents },
          { name: '事件数据', data: simulationData.events },
          { name: '指标数据', data: simulationData.metrics },
        ], `simulation-result-${timestamp}`);
        break;
        
      case 'csv':
        // 分别导出各个CSV文件
        CSVExportService.exportToCSV(simulationData.agents, `agents-${timestamp}`);
        setTimeout(() => {
          CSVExportService.exportToCSV(simulationData.events, `events-${timestamp}`);
        }, 500);
        setTimeout(() => {
          CSVExportService.exportToCSV(simulationData.metrics, `metrics-${timestamp}`);
        }, 1000);
        break;
        
      case 'json':
        JSONExportService.exportToJSON(simulationData, `simulation-result-${timestamp}`);
        break;
    }
  }

  // 导出网络数据
  static exportNetworkData(
    networkData: {
      nodes: any[];
      edges: any[];
      stats: any;
    },
    format: 'excel' | 'json' = 'excel'
  ): void {
    const timestamp = Date.now();
    
    if (format === 'excel') {
      ExcelExportService.exportMultipleSheets([
        { name: '节点', data: networkData.nodes },
        { name: '边', data: networkData.edges },
        { name: '统计', data: [networkData.stats] },
      ], `network-data-${timestamp}`);
    } else {
      JSONExportService.exportToJSON(networkData, `network-data-${timestamp}`);
    }
  }

  // 导出Agent列表
  static exportAgentList(agents: any[], format: 'excel' | 'csv' | 'json' = 'excel'): void {
    const timestamp = Date.now();
    
    switch (format) {
      case 'excel':
        ExcelExportService.exportToExcel(agents, {
          filename: `agent-list-${timestamp}`,
          sheetName: 'Agents'
        });
        break;
      case 'csv':
        CSVExportService.exportToCSV(agents, `agent-list-${timestamp}`);
        break;
      case 'json':
        JSONExportService.exportToJSON(agents, `agent-list-${timestamp}`);
        break;
    }
  }

  // 导出事件列表
  static exportEventList(events: any[], format: 'excel' | 'csv' | 'json' = 'excel'): void {
    const timestamp = Date.now();
    
    switch (format) {
      case 'excel':
        ExcelExportService.exportToExcel(events, {
          filename: `event-list-${timestamp}`,
          sheetName: 'Events'
        });
        break;
      case 'csv':
        CSVExportService.exportToCSV(events, `event-list-${timestamp}`);
        break;
      case 'json':
        JSONExportService.exportToJSON(events, `event-list-${timestamp}`);
        break;
    }
  }
}

export default ExportService;
