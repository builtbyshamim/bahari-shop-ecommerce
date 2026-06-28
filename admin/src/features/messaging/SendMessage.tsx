import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdEmail, MdSms, MdPeople, MdPerson, MdGroups } from 'react-icons/md';
import { useGetAllCustomerQuery } from '../customer/customerApi';
import { useGetAllTemplatesQuery, useSendMessageMutation } from './messagingApi';

const CHANNELS = [
  { value: 'email', label: 'Email', icon: <MdEmail size={18} />, color: 'text-blue-500' },
  { value: 'sms', label: 'SMS', icon: <MdSms size={18} />, color: 'text-green-500' },
  { value: 'both', label: 'Both', icon: <MdPeople size={18} />, color: 'text-purple-500' },
];

const TARGETS = [
  { value: 'all', label: 'All Customers', icon: <MdGroups size={18} /> },
  { value: 'single', label: 'Single Customer', icon: <MdPerson size={18} /> },
  { value: 'multiple', label: 'Multiple Customers', icon: <MdPeople size={18} /> },
];

const inputCls = 'w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm hover:border-gray-300';
const sectionCls = 'bg-white rounded-xl border border-gray-200 shadow-sm p-5';

const SendMessage = () => {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<any>({
    defaultValues: { channel: 'email', targetType: 'all', body: '' },
  });

  const channel = watch('channel');
  const targetType = watch('targetType');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const { data: customersData } = useGetAllCustomerQuery({ limit: 500 });
  const { data: templatesData } = useGetAllTemplatesQuery(undefined);

  const customers: any[] = customersData?.data?.data || [];
  const templates: any[] = (templatesData?.data || []).filter(
    (t: any) => t.isActive && (t.channel === channel || t.channel === 'both'),
  );

  const filteredCustomers = customers.filter(
    (c: any) =>
      !selectedUsers.find((s) => s.id === c.id) &&
      (c.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        c.phone?.includes(userSearch) ||
        c.email?.toLowerCase().includes(userSearch.toLowerCase())),
  );

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    const t = templates.find((tmpl: any) => tmpl.id === id);
    if (t) {
      setValue('subject', t.subject || '');
      setValue('body', t.body);
    }
  };

  const addUser = (user: any) => {
    if (targetType === 'single') setSelectedUsers([user]);
    else setSelectedUsers((prev) => [...prev, user]);
    setUserSearch('');
  };

  const removeUser = (id: string) => setSelectedUsers((prev) => prev.filter((u) => u.id !== id));

  const onSubmit = async (values: any) => {
    const payload: any = {
      channel: values.channel,
      targetType: values.targetType,
      subject: values.subject,
      body: values.body,
    };

    if (values.targetType !== 'all') {
      if (!selectedUsers.length) {
        toast.error('Please select at least one customer');
        return;
      }
      payload.userIds = selectedUsers.map((u) => u.id);
    }

    try {
      const res = await sendMessage(payload).unwrap();
      const logData = res?.data || res;
      const sent = logData?.totalSent ?? '';
      const failed = logData?.totalFailed ?? '';
      toast.success(`Message sent! ${sent} delivered${failed ? `, ${failed} failed` : ''}`);
      reset({ channel: 'email', targetType: 'all', body: '', subject: '' });
      setSelectedUsers([]);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Send Message</h1>
        <p className="text-gray-500 mt-1">Send custom SMS or Email to your customers</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Channel Selector */}
        <div className={sectionCls}>
          <label className="block text-sm font-medium text-gray-700 mb-3">Message Channel *</label>
          <div className="grid grid-cols-3 gap-3">
            {CHANNELS.map(({ value, label, icon, color }) => {
              const active = channel === value;
              return (
                <label
                  key={value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${
                    active ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" {...register('channel')} value={value} className="hidden" />
                  <span className={active ? 'text-primary-500' : color}>{icon}</span>
                  <span className={`text-sm font-medium ${active ? 'text-primary-600' : 'text-gray-600'}`}>{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Target Selector */}
        <div className={sectionCls}>
          <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience *</label>
          <div className="grid grid-cols-3 gap-3">
            {TARGETS.map(({ value, label, icon }) => {
              const active = targetType === value;
              return (
                <label
                  key={value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${
                    active ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" {...register('targetType')} value={value} className="hidden" />
                  <span className={active ? 'text-primary-500' : 'text-gray-500'}>{icon}</span>
                  <span className={`text-sm font-medium text-center ${active ? 'text-primary-600' : 'text-gray-600'}`}>{label}</span>
                </label>
              );
            })}
          </div>

          {/* Customer search for single/multiple */}
          {targetType !== 'all' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search & Select Customer(s)</label>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className={inputCls}
                placeholder="Search by name, phone or email…"
              />
              {userSearch && filteredCustomers.length > 0 && (
                <div className="mt-1 border border-gray-200 rounded-lg shadow-sm max-h-48 overflow-y-auto bg-white">
                  {filteredCustomers.slice(0, 10).map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => addUser(c)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b last:border-0"
                    >
                      <span className="font-medium">{c.name || 'N/A'}</span>
                      <span className="text-gray-400 ml-2">{c.phone || c.email}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedUsers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedUsers.map((u) => (
                    <span key={u.id} className="flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-1 rounded-full text-xs font-medium">
                      {u.name || u.phone}
                      <button type="button" onClick={() => removeUser(u.id)} className="ml-1 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Template selector */}
        {templates.length > 0 && (
          <div className={sectionCls}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Load from Template (optional)</label>
            <select onChange={handleTemplateSelect} className={inputCls}>
              <option value="">— Select a template —</option>
              {templates.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Message Compose */}
        <div className={`${sectionCls} space-y-4`}>
          <h2 className="text-base font-semibold text-gray-700">Compose Message</h2>

          {(channel === 'email' || channel === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
              <input {...register('subject')} className={inputCls} placeholder="Subject line" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Body *</label>
            <textarea
              {...register('body', { required: 'Message body is required' })}
              rows={8}
              className={`${inputCls} resize-none`}
              placeholder={channel === 'sms' ? 'Write SMS text… (use {{name}} for personalization)' : 'Write HTML or plain text… (use {{name}} for personalization)'}
            />
            {errors.body && <p className="text-red-500 text-xs mt-1">{String(errors.body.message)}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Tip: Use <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code> to personalize each message with recipient's name
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn px-8 py-2.5 disabled:opacity-60"
          >
            {isLoading ? 'Sending…' : `Send ${channel === 'both' ? 'Email & SMS' : channel.toUpperCase()}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendMessage;
