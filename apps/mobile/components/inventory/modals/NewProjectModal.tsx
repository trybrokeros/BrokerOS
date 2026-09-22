import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../lib/auth-client';

interface NewProjectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isCpProject?: boolean;
}

export default function NewProjectModal({ isVisible, onClose, onSuccess, isCpProject = false }: NewProjectModalProps) {
  const [form, setForm] = useState({
    name: '',
    builderName: '',
    type: 'RESIDENTIAL',
    city: '',
    address: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.builderName.trim()) return;

    try {
      setIsSaving(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const { error } = await authClient.$fetch('/api/inventory/projects', {
        method: 'POST',
        baseURL: baseUrl,
        body: { ...form, isCpProject }
      });

      if (error) throw new Error(error.message || "Failed to create project");

      Toast.show({ type: 'success', text1: 'Success', text2: 'Project created successfully' });
      onSuccess();
      onClose();
      setForm({ name: '', builderName: '', type: 'RESIDENTIAL', city: '', address: '' }); // reset
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message || "Failed to create project" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-slate-900/50 justify-end"
      >
        <View className="bg-white rounded-t-3xl max-h-[90%]">
          <View className="p-6 border-b border-slate-100 flex-row justify-between items-center bg-slate-50 rounded-t-3xl">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-indigo-100 rounded-xl items-center justify-center mr-3">
                <Feather name="layout" size={20} color="#4f46e5" />
              </View>
              <View>
                <Text className="text-xl font-bold text-slate-900">New Project</Text>
                <Text className="text-xs text-slate-500">Create a new real estate project</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-200 rounded-full">
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6">
            <View className="space-y-5 mb-10">
              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-1.5">Project Name *</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  placeholder="e.g. Skyline Towers"
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 bg-white"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-1.5">Builder Name *</Text>
                <TextInput
                  value={form.builderName}
                  onChangeText={(text) => setForm({ ...form, builderName: text })}
                  placeholder="e.g. DLF Group"
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 bg-white"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-1.5">Project Type</Text>
                <View className="flex-row gap-2">
                  {['RESIDENTIAL', 'COMMERCIAL', 'MIXED'].map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setForm({ ...form, type })}
                      className={`flex-1 py-3 items-center rounded-xl border ${form.type === type ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}
                    >
                      <Text className={`text-xs font-semibold ${form.type === type ? 'text-indigo-700' : 'text-slate-600'}`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-1.5">City</Text>
                <TextInput
                  value={form.city}
                  onChangeText={(text) => setForm({ ...form, city: text })}
                  placeholder="e.g. Mumbai"
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 bg-white"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-1.5">Address</Text>
                <TextInput
                  value={form.address}
                  onChangeText={(text) => setForm({ ...form, address: text })}
                  placeholder="Full site address..."
                  multiline
                  numberOfLines={3}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 bg-white min-h-[80px]"
                  placeholderTextColor="#94a3b8"
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>

          <View className="p-6 border-t border-slate-100 bg-slate-50 flex-row gap-3 pb-8">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3.5 bg-white border border-slate-200 rounded-xl items-center"
            >
              <Text className="text-slate-700 font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSaving || !form.name.trim() || !form.builderName.trim()}
              className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center gap-2 ${isSaving || !form.name.trim() || !form.builderName.trim() ? 'bg-indigo-400' : 'bg-indigo-600'}`}
            >
              {isSaving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Feather name="save" size={18} color="white" />
              )}
              <Text className="text-white font-semibold">{isSaving ? 'Creating...' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
