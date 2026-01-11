import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import {
  getModelConfigs,
  addModelConfig,
  updateModelConfig,
  deleteModelConfig,
  toggleModelStatus,
} from '@/services/cloudbase';
import { Icon } from 'tdesign-icons-react';
import {
  Dialog,
  Form,
  Input,
  Select,
  Button,
  Table,
  Tag,
  MessagePlugin,
  Popconfirm,
} from 'tdesign-react';
import type { AIModelConfig, ModelConfigForm } from '@/types';
import styles from './AdminPanel.module.css';

const { FormItem } = Form;

interface AdminPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ visible, onClose }) => {
  const {
    modelConfigs,
    isLoading,
    editingModel,
    isModalOpen,
    setModelConfigs,
    setIsLoading,
    setEditingModel,
    setIsModalOpen,
  } = useAdminStore();

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 加载模型配置
  useEffect(() => {
    if (visible) {
      loadModelConfigs();
    }
  }, [visible]);

  const loadModelConfigs = async () => {
    setIsLoading(true);
    try {
      const configs = await getModelConfigs();
      setModelConfigs(configs);
    } catch (error) {
      MessagePlugin.error('加载模型配置失败');
      console.error('加载模型配置失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开添加/编辑弹窗
  const openModal = (model?: AIModelConfig) => {
    setEditingModel(model || null);
    if (model) {
      form.setFieldsValue({
        name: model.name,
        type: model.type,
        provider: model.provider,
        apiUrl: model.apiUrl,
        accessKey: '',
        secretKey: '',
      });
    } else {
      form.reset();
    }
    setIsModalOpen(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingModel(null);
    form.reset();
  };

  // 提交表单
  const handleSubmit = async () => {
    const result = await form.validate();
    if (result !== true) return;

    const values = form.getFieldsValue(true) as ModelConfigForm;
    setSubmitting(true);

    try {
      if (editingModel) {
        await updateModelConfig(editingModel.id, values);
        MessagePlugin.success('模型配置更新成功');
      } else {
        await addModelConfig(values);
        MessagePlugin.success('模型配置添加成功');
      }
      closeModal();
      loadModelConfigs();
    } catch (error) {
      MessagePlugin.error(editingModel ? '更新失败' : '添加失败');
      console.error('保存模型配置失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 删除模型
  const handleDelete = async (id: string) => {
    try {
      await deleteModelConfig(id);
      MessagePlugin.success('模型配置已删除');
      loadModelConfigs();
    } catch (error) {
      MessagePlugin.error('删除失败');
      console.error('删除模型配置失败:', error);
    }
  };

  // 切换状态
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await toggleModelStatus(id, newStatus);
      MessagePlugin.success(`模型已${newStatus === 'active' ? '启用' : '禁用'}`);
      loadModelConfigs();
    } catch (error) {
      MessagePlugin.error('状态切换失败');
      console.error('切换模型状态失败:', error);
    }
  };

  // 表格列定义
  const columns = [
    {
      colKey: 'name',
      title: '模型名称',
      width: 150,
    },
    {
      colKey: 'type',
      title: '类型',
      width: 120,
      cell: ({ row }: { row: AIModelConfig }) => (
        <Tag theme={row.type === 'text2img' ? 'primary' : 'success'} variant="light">
          {row.type === 'text2img' ? '文生图' : '图生3D'}
        </Tag>
      ),
    },
    {
      colKey: 'provider',
      title: '提供商',
      width: 100,
      cell: ({ row }: { row: AIModelConfig }) => {
        const providerNames: Record<string, string> = {
          hunyuan: '混元',
          doubao: '豆包',
          custom: '自定义',
        };
        return providerNames[row.provider] || row.provider;
      },
    },
    {
      colKey: 'apiUrl',
      title: 'API URL',
      ellipsis: true,
    },
    {
      colKey: 'status',
      title: '状态',
      width: 100,
      cell: ({ row }: { row: AIModelConfig }) => (
        <Tag
          theme={row.status === 'active' ? 'success' : row.status === 'error' ? 'danger' : 'warning'}
          variant="light"
        >
          {row.status === 'active' ? '正常' : row.status === 'error' ? '异常' : '已禁用'}
        </Tag>
      ),
    },
    {
      colKey: 'latency',
      title: '延迟',
      width: 80,
      cell: ({ row }: { row: AIModelConfig }) =>
        row.latency ? `${row.latency}ms` : '-',
    },
    {
      colKey: 'operations',
      title: '操作',
      width: 200,
      cell: ({ row }: { row: AIModelConfig }) => (
        <div className={styles.tableActions}>
          <Button
            theme="primary"
            variant="text"
            size="small"
            onClick={() => openModal(row)}
          >
            编辑
          </Button>
          <Button
            theme={row.status === 'active' ? 'warning' : 'success'}
            variant="text"
            size="small"
            onClick={() => handleToggleStatus(row.id, row.status)}
          >
            {row.status === 'active' ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            content="确定要删除此模型配置吗？"
            onConfirm={() => handleDelete(row.id)}
          >
            <Button theme="danger" variant="text" size="small">
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 模型类型选项
  const typeOptions = [
    { label: '文生图', value: 'text2img' },
    { label: '图生3D', value: 'img2model3d' },
  ];

  // 提供商选项
  const providerOptions = [
    { label: '混元', value: 'hunyuan' },
    { label: '豆包', value: 'doubao' },
    { label: '自定义', value: 'custom' },
  ];

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      header="模型配置管理"
      width={1000}
      footer={false}
      className={styles.adminDialog}
    >
      <div className={styles.adminPanel}>
        <div className={styles.panelHeader}>
          <h3>AI 模型配置</h3>
          <Button theme="primary" onClick={() => openModal()}>
            <Icon name="add" />
            添加模型
          </Button>
        </div>

        <Table
          data={modelConfigs}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          hover
          stripe
          size="medium"
          empty="暂无模型配置"
        />

        {/* 添加/编辑模型弹窗 */}
        <Dialog
          visible={isModalOpen}
          onClose={closeModal}
          header={editingModel ? '编辑模型配置' : '添加模型配置'}
          confirmBtn={
            <Button theme="primary" loading={submitting} onClick={handleSubmit}>
              {editingModel ? '保存修改' : '添加'}
            </Button>
          }
          cancelBtn={
            <Button variant="outline" onClick={closeModal}>
              取消
            </Button>
          }
        >
          <Form form={form} labelWidth={100}>
            <FormItem label="模型名称" name="name" rules={[{ required: true, message: '请输入模型名称' }]}>
              <Input placeholder="例如：混元图像 v1" />
            </FormItem>

            <FormItem label="模型类型" name="type" rules={[{ required: true, message: '请选择模型类型' }]}>
              <Select options={typeOptions} placeholder="选择模型类型" />
            </FormItem>

            <FormItem label="提供商" name="provider" rules={[{ required: true, message: '请选择提供商' }]}>
              <Select options={providerOptions} placeholder="选择提供商" />
            </FormItem>

            <FormItem label="API URL" name="apiUrl" rules={[{ required: true, message: '请输入 API URL' }]}>
              <Input placeholder="https://api.example.com/v1/images/generations" />
            </FormItem>

            <FormItem
              label="Access Key"
              name="accessKey"
              rules={[{ required: !editingModel, message: '请输入 Access Key' }]}
            >
              <Input
                type="password"
                placeholder={editingModel ? '留空则不修改' : '输入 Access Key (AK)'}
              />
            </FormItem>

            <FormItem
              label="Secret Key"
              name="secretKey"
              rules={[{ required: !editingModel, message: '请输入 Secret Key' }]}
            >
              <Input
                type="password"
                placeholder={editingModel ? '留空则不修改' : '输入 Secret Key (SK)'}
              />
            </FormItem>
          </Form>
        </Dialog>
      </div>
    </Dialog>
  );
};
