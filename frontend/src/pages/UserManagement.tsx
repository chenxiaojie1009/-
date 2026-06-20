import { useState, useEffect } from "react";
import { Table, Card, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm, message, Typography } from "antd";
import { TeamOutlined, PlusOutlined, KeyOutlined } from "@ant-design/icons";
import api from "../api/client";

const { Title } = Typography;
const roleColors: Record<string, string> = { admin: "red", editor: "blue", viewer: "green" };
const roleLabels: Record<string, string> = { admin: "管理员", editor: "编辑者", viewer: "查看者" };

interface UserRecord { id: number; username: string; display_name: string; role: string; is_active: boolean; }

export default function UserManagement() {
  const [data, setData] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState<UserRecord | null>(null);
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try { const res = await api.get("/users"); setData(res.data || []); }
    catch { setData([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await api.post("/users", values);
      message.success("创建成功");
      setCreateOpen(false); form.resetFields(); fetchUsers();
    } catch (err: any) {
      if (err.response) message.error(err.response.data?.detail || "创建失败");
    }
  };

  const handleResetPassword = async () => {
    try {
      const values = await resetForm.validateFields();
      await api.put("/users/" + resetUser!.id + "/reset-password", { new_password: values.new_password });
      message.success("密码已重置，用户下次登录需修改密码");
      setResetOpen(false); resetForm.resetFields(); setResetUser(null);
    } catch (err: any) {
      if (err.response) message.error(err.response.data?.detail || "重置失败");
    }
  };

  const handleToggleActive = async (user: UserRecord) => {
    try {
      await api.put("/users/" + user.id, { is_active: !user.is_active, role: user.role, username: user.username, password: "", display_name: user.display_name });
      message.success(user.is_active ? "已禁用" : "已启用"); fetchUsers();
    } catch { message.error("操作失败"); }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete("/users/" + id); message.success("已删除"); fetchUsers(); }
    catch { message.error("删除失败"); }
  };

  const columns = [
    { title: "用户名", dataIndex: "username", width: 140 },
    { title: "显示名", dataIndex: "display_name", width: 140 },
    { title: "角色", dataIndex: "role", width: 100, render: (v: string) => <Tag color={roleColors[v]}>{roleLabels[v]}</Tag> },
    { title: "状态", dataIndex: "is_active", width: 80, render: (v: boolean) => v ? <Tag color="success">正常</Tag> : <Tag color="error">禁用</Tag> },
    { title: "操作", width: 280,
      render: (_: any, record: UserRecord) => (
        <Space>
          <Button size="small" type="link" icon={<KeyOutlined />}
            onClick={() => { setResetUser(record); setResetOpen(true); }}>重置密码</Button>
          <Popconfirm title="确定切换状态？" onConfirm={() => handleToggleActive(record)}>
            <Button size="small" type="link">{record.is_active ? "禁用" : "启用"}</Button>
          </Popconfirm>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}><TeamOutlined style={{ marginRight: 8 }} />用户管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>添加用户</Button>
      </div>
      <Card>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 15 }} locale={{ emptyText: "暂无用户" }} />
      </Card>

      <Modal title="添加用户" open={createOpen} onOk={handleCreate} onCancel={() => { setCreateOpen(false); form.resetFields(); }} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, min: 2, max: 64 }]}><Input placeholder="登录用户名" /></Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, max: 128 }]}><Input.Password placeholder="至少6位" /></Form.Item>
          <Form.Item name="display_name" label="显示名称"><Input placeholder="可选" /></Form.Item>
          <Form.Item name="role" label="角色" initialValue="viewer" rules={[{ required: true }]}>
            <Select options={Object.entries(roleLabels).map(([k, v]) => ({ label: v, value: k }))} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={"重置密码 — " + (resetUser?.username || "")} open={resetOpen} onOk={handleResetPassword}
        onCancel={() => { setResetOpen(false); resetForm.resetFields(); setResetUser(null); }} destroyOnClose>
        <Form form={resetForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="new_password" label="新密码" rules={[{ required: true, min: 6, message: "至少6位" }]}>
            <Input.Password placeholder="输入新密码" />
          </Form.Item>
          <Form.Item name="confirm" dependencies={["new_password"]} label="确认新密码" rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                return Promise.reject(new Error("两次密码不一致"));
              },
            }),
          ]}>
            <Input.Password placeholder="再次输入" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
