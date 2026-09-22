import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { UnitGrid } from '../grid/UnitGrid';
import { UnitDetailsModal } from '../modals/UnitDetailsModal';
import { authClient } from '../../../lib/auth-client';

interface AiTowerGeneratorProps {
  projectId: string;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AiTowerGenerator({ projectId, visible, onClose, onSuccess }: AiTowerGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch(`/api/inventory/projects/${projectId}/towers/ai-generate`, {
        method: 'POST',
        baseURL: baseUrl,
        body: { prompt }
      });

      if (res.error) throw new Error(res.error.message || "AI Generation failed");
      setGeneratedData(res.data);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Tower plan generated successfully' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err?.message || "Failed to generate tower" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedData) return;
    try {
      setIsSaving(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch(`/api/inventory/projects/${projectId}/towers`, {
        method: 'POST',
        baseURL: baseUrl,
        body: generatedData
      });

      if (res.error) throw new Error(res.error.message || "Failed to save generated tower");
      Toast.show({ type: 'success', text1: 'Success', text2: 'Tower saved successfully' });
      onSuccess();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err?.message || "Failed to save tower" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualUnitUpdate = async (unitId: string, updates: any) => {
    setGeneratedData((prev: any) => {
      const newData = { ...prev };
      for (const floor of newData.floors) {
        const unitIndex = floor.units.findIndex((u: any) => (u.id || u.unitNumber) === unitId);
        if (unitIndex !== -1) {
          floor.units[unitIndex] = { ...floor.units[unitIndex], ...updates };
        }
      }
      return newData;
    });
    setSelectedUnit(null);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-slate-50">
        <View className="flex-row justify-between items-center p-4 border-b border-slate-200 bg-white">
          <View className="flex-row items-center gap-2">
            <View className="bg-indigo-100 p-2 rounded-lg">
              <Feather name="cpu" size={20} color="#4f46e5" />
            </View>
            <Text className="text-lg font-bold text-slate-900">AI Tower Generator</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Feather name="x" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {!generatedData ? (
            <View className="items-center justify-center py-20">
              <Feather name="message-square" size={48} color="#cbd5e1" />
              <Text className="text-slate-500 font-medium mt-4">Try describing your tower naturally.</Text>
            </View>
          ) : (
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-slate-900">Preview: {generatedData.name}</Text>
                <View className="bg-amber-100 px-3 py-1 rounded-full">
                  <Text className="text-amber-700 text-xs font-bold">Draft</Text>
                </View>
              </View>
              <Text className="text-slate-500 mb-4">Tap any unit below to manually edit its properties.</Text>

              <View className="h-[400px]">
                <UnitGrid
                  tower={generatedData}
                  onUnitClick={(unit: any) => setSelectedUnit(unit)}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="p-4 bg-white border-t border-slate-200">
          {generatedData && (
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={() => setGeneratedData(null)}
                className="flex-1 py-3 bg-slate-100 rounded-xl items-center justify-center flex-row gap-2"
              >
                <Feather name="refresh-cw" size={16} color="#475569" />
                <Text className="font-bold text-slate-700">Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className="flex-[2] py-3 bg-emerald-600 rounded-xl items-center justify-center flex-row gap-2"
              >
                {isSaving ? <ActivityIndicator color="white" /> : <Feather name="save" size={16} color="white" />}
                <Text className="font-bold text-white">Save Tower</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row gap-2">
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="E.g. Create a 5 floor tower..."
              placeholderTextColor="#94a3b8"
              className="flex-1 bg-slate-100 px-4 py-3 rounded-xl text-slate-900"
              multiline
              maxLength={300}
            />
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={!prompt.trim() || isGenerating || isSaving}
              className={`w-12 h-12 rounded-xl items-center justify-center ${!prompt.trim() ? 'bg-slate-300' : 'bg-indigo-600'}`}
            >
              {isGenerating ? <ActivityIndicator color="white" /> : <Feather name="send" size={20} color="white" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Unit Edit Modal for Drafts */}
      <UnitDetailsModal
        unit={selectedUnit}
        visible={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onSave={handleManualUnitUpdate}
      />
    </Modal>
  );
}
