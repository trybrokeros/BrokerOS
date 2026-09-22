import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import PossessionModal from './PossessionModal';
import { UnitDetailsView } from './UnitDetailsView';
import { UnitDetailsForm } from './UnitDetailsForm';
import { UnitDetailsPostSales } from './UnitDetailsPostSales';

interface UnitDetailsModalProps {
  unit: any;
  visible: boolean;
  onClose: () => void;
  onSave: (unitId: string, updates: any) => Promise<void>;
}

export function UnitDetailsModal({ unit, visible, onClose, onSave }: UnitDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPossessionModalOpen, setIsPossessionModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    status: 'AVAILABLE',
    basePrice: '0',
    carpetArea: '0',
    type: 'TWO_BHK',
    facing: 'East',
    commissionPercentage: '0',
    commissionAmount: '0',
  });

  useEffect(() => {
    if (unit) {
      const basePrice = unit.basePrice || 0;
      const commissionPercentage = unit.commissionPercentage || 0;
      const commissionAmount = (basePrice * commissionPercentage) / 100;

      setFormData({
        status: unit.status || 'AVAILABLE',
        basePrice: basePrice.toString(),
        carpetArea: unit.carpetArea?.toString() || '0',
        type: unit.type || 'TWO_BHK',
        facing: unit.facing || 'East',
        commissionPercentage: commissionPercentage.toString(),
        commissionAmount: commissionAmount.toString(),
      });
      setIsEditing(false);
    }
  }, [unit]);

  useEffect(() => {
    const fetchBooking = async () => {
      if (unit && (unit.status === 'RESERVED' || unit.status === 'SOLD')) {
        try {
          setLoadingBooking(true);
          const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
          const res = await fetch(`${apiUrl}/api/inventory/units/${unit.id}/booking`);
          if (res.ok) {
            const data = await res.json();
            setBookingData(data);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingBooking(false);
        }
      } else {
        setBookingData(null);
      }
    };
    if (visible) fetchBooking();
  }, [unit, visible]);

  if (!unit) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(unit.id || unit.unitNumber, {
        ...formData,
        basePrice: Number(formData.basePrice),
        carpetArea: Number(formData.carpetArea),
        commissionPercentage: Number(formData.commissionPercentage),
      });
      setIsEditing(false);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Unit details updated successfully' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save unit details' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelBooking = () => {
    if (!bookingData) return;
    Alert.prompt(
      "Cancel Booking",
      "Enter reason for cancellation:",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async (reason?: string) => {
            if (!reason) {
              Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Reason is required to cancel a booking.' });
              return;
            }
            try {
              setIsCancelling(true);
              const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
              const res = await fetch(`${apiUrl}/api/leads/${bookingData.customer.leadId}/booking/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: bookingData.id, reason })
              });
              if (res.ok) {
                // Trigger a fake "AVAILABLE" update to refresh grid and close drawer safely
                await onSave(unit.id || unit.unitNumber, { ...formData, status: 'AVAILABLE', clearBooking: true });
                Toast.show({ type: 'success', text1: 'Success', text2: 'Booking cancelled successfully' });
                onClose(); // Close and refresh
              } else {
                Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to cancel booking' });
              }
            } catch (error) {
              console.error(error);
              Toast.show({ type: 'error', text1: 'Error', text2: 'Error cancelling booking' });
            } finally {
              setIsCancelling(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-slate-50"
      >
        <View className="flex-row justify-between items-center p-4 border-b border-slate-200 bg-white">
          <View>
            <Text className="text-xl font-bold text-slate-900">Unit {unit.unitNumber}</Text>
            <Text className="text-xs text-slate-500 mt-1 font-medium">Floor {unit.floor?.floorNumber || 'Unknown'}</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
            <Feather name="x" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-5">
          {!isEditing ? (
            <>
              <UnitDetailsView 
                unit={unit} 
                bookingData={bookingData} 
                onEditPress={() => setIsEditing(true)} 
              />
              <UnitDetailsPostSales 
                unit={unit} 
                bookingData={bookingData}
                handleCancelBooking={handleCancelBooking}
                isCancelling={isCancelling}
                onUpdateTimelinePress={() => setIsPossessionModalOpen(true)} 
              />
            </>
          ) : (
            <UnitDetailsForm 
              formData={formData} 
              setFormData={setFormData} 
              onCancel={() => setIsEditing(false)} 
              onSave={handleSave} 
              isSaving={isSaving} 
            />
          )}

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>

      <PossessionModal
        isOpen={isPossessionModalOpen}
        onClose={() => setIsPossessionModalOpen(false)}
        entityId={unit.id || unit.unitNumber}
        entityType="unit"
        entityName={`Unit ${unit.unitNumber}`}
        initialStatus={unit.processionStatus}
        initialTimeline={unit.processionTimelineUnit ? { value: unit.processionTimelineValue, unit: unit.processionTimelineUnit } : undefined}
        onSuccess={() => {
          onClose(); // Close details modal entirely or we can trigger a refresh instead
        }}
      />
    </Modal>
  );
}
