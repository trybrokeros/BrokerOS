import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../lib/auth-client';

interface BrokerAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isCP?: boolean;
}

export function BrokerAddModal({ visible, onClose, onSuccess, isCP }: BrokerAddModalProps) {
  const [form, setForm] = useState({
    companyName: '',
    name: '',
    phone: '',
    city: '',
    sourcingManagerId: '',
    reraNumber: '',
    gstNumber: '',
    serviceAreas: '',
    assignedProjects: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [sourcingManagers, setSourcingManagers] = useState<any[]>([]);

  React.useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const fetchData = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const projRes = await authClient.$fetch('/api/inventory/projects?isCpProject=true', { baseURL: baseUrl });
      if (projRes.data) setProjects(projRes.data as any[]);

      if (isCP) {
        const smRes = await authClient.$fetch('/api/sourcing-managers', { baseURL: baseUrl });
        if (smRes.data) setSourcingManagers(smRes.data as any[]);
      }
    } catch (e) {
      console.log('Error fetching options', e);
    }
  };

  const handleSubmit = async () => {
    if (!form.companyName || !form.name || !form.phone || !form.city) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch('/api/brokers', {
        baseURL: baseUrl,
        method: 'POST',
        body: form
      });
      if (res.error) throw new Error(res.error.message);

      Toast.show({ type: 'success', text1: 'Success', text2: 'Broker created successfully' });
      onSuccess();
      setForm({ companyName: '', name: '', phone: '', city: '', sourcingManagerId: '', reraNumber: '', gstNumber: '', serviceAreas: '', assignedProjects: [] });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to create broker' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl h-[85%]">
          <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
            <Text className="text-xl font-bold text-slate-900">Add New Broker</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5" keyboardShouldPersistTaps="handled">
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-1.5">Company Name *</Text>
                <TextInput
                  value={form.companyName}
                  onChangeText={v => setForm({ ...form, companyName: v })}
                  placeholder="e.g. Skyline Realty"
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-1.5">Contact Person *</Text>
                <TextInput
                  value={form.name}
                  onChangeText={v => setForm({ ...form, name: v })}
                  placeholder="e.g. John Doe"
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-1.5">Phone Number *</Text>
                <TextInput
                  value={form.phone}
                  onChangeText={v => setForm({ ...form, phone: v })}
                  placeholder="+91..."
                  keyboardType="phone-pad"
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-1.5">City *</Text>
                <TextInput
                  value={form.city}
                  onChangeText={v => setForm({ ...form, city: v })}
                  placeholder="e.g. Mumbai"
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-1.5">RERA Number (Optional)</Text>
                <TextInput
                  value={form.reraNumber}
                  onChangeText={v => setForm({ ...form, reraNumber: v })}
                  placeholder="e.g. PR/MH/..."
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-1.5">GST Number (Optional)</Text>
                <TextInput
                  value={form.gstNumber}
                  onChangeText={v => setForm({ ...form, gstNumber: v })}
                  placeholder="e.g. 27AADCB..."
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-1.5">Service Areas</Text>
                <TextInput
                  value={form.serviceAreas}
                  onChangeText={v => setForm({ ...form, serviceAreas: v })}
                  placeholder="e.g. Bandra, Andheri"
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-2">Assign Projects</Text>
                <View className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
                  {projects.length === 0 ? (
                    <Text className="text-slate-500 italic p-2 text-center">No projects found.</Text>
                  ) : (
                    projects.map(p => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => {
                          if (form.assignedProjects.includes(p.id)) {
                            setForm({ ...form, assignedProjects: form.assignedProjects.filter(id => id !== p.id) });
                          } else {
                            setForm({ ...form, assignedProjects: [...form.assignedProjects, p.id] });
                          }
                        }}
                        className="flex-row items-center p-2 mb-1"
                      >
                        <View className={`w-5 h-5 rounded border items-center justify-center mr-3 ${form.assignedProjects.includes(p.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                          {form.assignedProjects.includes(p.id) && <Feather name="check" size={14} color="#fff" />}
                        </View>
                        <Text className="text-slate-900 flex-1">{p.name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>

              {isCP && (
                <View>
                  <Text className="text-sm font-bold text-slate-700 mb-1.5">Assign Sourcing Manager</Text>
                  <View className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2">
                      <TouchableOpacity
                        onPress={() => setForm({ ...form, sourcingManagerId: '' })}
                        className={`px-4 py-2 rounded-lg mr-2 border ${!form.sourcingManagerId ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}
                      >
                        <Text className={!form.sourcingManagerId ? 'text-indigo-700 font-bold' : 'text-slate-600'}>Unassigned</Text>
                      </TouchableOpacity>
                      {sourcingManagers.map(sm => (
                        <TouchableOpacity
                          key={sm.id}
                          onPress={() => setForm({ ...form, sourcingManagerId: sm.id })}
                          className={`px-4 py-2 rounded-lg mr-2 border ${form.sourcingManagerId === sm.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}
                        >
                          <Text className={form.sourcingManagerId === sm.id ? 'text-indigo-700 font-bold' : 'text-slate-600'}>{sm.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}

              {/* Padding for bottom scroll */}
              <View className="h-10" />
            </View>
          </ScrollView>

          <View className="p-5 border-t border-slate-100 bg-white">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`py-4 rounded-xl flex-row items-center justify-center ${loading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Create Broker</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
