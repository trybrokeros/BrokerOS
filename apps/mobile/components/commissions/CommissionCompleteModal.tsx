import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

interface CommissionCompleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (file: any) => Promise<void>;
  isSaving: boolean;
  commissionAmount: number | string;
}

export function CommissionCompleteModal({ visible, onClose, onConfirm, isSaving, commissionAmount }: CommissionCompleteModalProps) {
  const [file, setFile] = useState<any>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });
      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Sorry, we need camera permissions to capture receipts.' });
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        setFile({
          uri: result.assets[0].uri,
          name: `receipt_${Date.now()}.jpg`,
          type: 'image/jpeg'
        });
      }
    } catch (err) {
      console.log('Camera error:', err);
    }
  };

  const handleConfirm = async () => {
    await onConfirm(file);
    setFile(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xl font-bold text-slate-900">Complete Payment</Text>
              <Text className="text-sm text-slate-500 mt-1">Net payable: <Text className="font-bold text-emerald-600">₹{Number(commissionAmount).toLocaleString('en-IN')}</Text></Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View className="mb-8">
            <Text className="text-sm font-bold text-slate-700 mb-3">Upload Payment Receipt (Optional)</Text>
            
            {file ? (
              <View className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-4">
                  <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                    <Feather name="file-text" size={20} color="#4f46e5" />
                  </View>
                  <Text className="text-sm font-bold text-slate-900 flex-1" numberOfLines={1}>{file.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setFile(null)} className="p-2 bg-white rounded-full">
                  <Feather name="trash-2" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={pickDocument}
                  className="flex-1 border-2 border-dashed border-slate-200 rounded-xl py-6 items-center justify-center bg-slate-50"
                >
                  <Feather name="upload-cloud" size={24} color="#64748b" className="mb-2" />
                  <Text className="text-sm font-bold text-slate-700">Upload File</Text>
                  <Text className="text-xs text-slate-500">PDF, JPG, PNG</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={takePhoto}
                  className="flex-1 border-2 border-dashed border-slate-200 rounded-xl py-6 items-center justify-center bg-slate-50"
                >
                  <Feather name="camera" size={24} color="#64748b" className="mb-2" />
                  <Text className="text-sm font-bold text-slate-700">Take Photo</Text>
                  <Text className="text-xs text-slate-500">Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={onClose}
              disabled={isSaving}
              className="flex-1 py-4 bg-slate-100 rounded-xl items-center justify-center"
            >
              <Text className="text-slate-700 font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleConfirm}
              disabled={isSaving}
              className="flex-1 py-4 bg-emerald-600 rounded-xl items-center justify-center flex-row gap-2"
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Feather name="check-circle" size={18} color="white" />
                  <Text className="text-white font-bold">Confirm</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
